/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const compression = require('compression');
const nocache = require('nocache');
const ForgeSDK = require('@arcblock/forge-sdk');
const EventServer = require('@arcblock/event-server');

// ------------------------------------------------------------------------------
// Routes: due to limitations of netlify functions, we need to import routes here
// ------------------------------------------------------------------------------
const { decode } = require('../libs/jwt');
const { walletHandlers, swapHandlers, wallet } = require('../libs/auth');
const { getAccountStateOptions } = require('../libs/util');

const isProduction = process.env.NODE_ENV === 'production';
const isNetlify = process.env.NETLIFY && JSON.parse(process.env.NETLIFY);

if (!process.env.MONGO_URI) {
  throw new Error('Cannot start application without process.env.MONGO_URI');
}

// Connect to database
let isConnectedBefore = false;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, autoReconnect: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.on('disconnected', () => {
  console.log('Lost MongoDB connection...');
  if (!isConnectedBefore) {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, autoReconnect: true });
  }
});
mongoose.connection.on('connected', () => {
  isConnectedBefore = true;
  console.log('Connection established to MongoDB');
});
mongoose.connection.on('reconnected', () => {
  console.log('Reconnected to MongoDB');
});

// Create and config express application
const app = express();
const server = http.createServer(app);

// Only enable socket server in production, since live reload will also have socket server
if (isProduction && !isNetlify) {
  const eventServer = new EventServer(server, ['auth']);
  walletHandlers.on('scanned', data => eventServer.dispatch('auth', data));
  walletHandlers.on('succeed', data => eventServer.dispatch('auth', data));
  walletHandlers.on('failed', data => eventServer.dispatch('auth', data));
}

app.use(cookieParser());
app.use(bodyParser.json({ limit: '1 mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1 mb' }));
app.use(cors());

app.use(
  morgan((tokens, req, res) => {
    const log = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');

    if (isProduction) {
      // Log only in AWS context to get back function logs
      console.log(log);
    }

    return log;
  })
);

app.use(bearerToken());
app.use((req, res, next) => {
  if (!req.token) {
    next();
    return;
  }

  decode(req.token)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(() => {
      next();
    });
});

const router = express.Router();

// Currency
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/receive_token')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/send_token')));
swapHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap_token')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/login')));

require('../routes/session').init(router);
require('../routes/orders').init(router);

// Check for application account
ForgeSDK.getAccountState({ address: wallet.address }, getAccountStateOptions)
  .then(res => {
    if (!res.state) {
      console.log('\n----------');
      console.error('Application account not declared on chain, abort!');
      console.error('Please run `node tools/declare.js` then start the application again');
      console.log('----------\n');
      process.exit(1);
    } else {
      console.error('Application account declared on chain');
    }
  })
  .catch(err => {
    console.error(err);
    console.log('\n----------');
    console.error('Application account check failed, abort!');
    console.log('----------\n');
    process.exit(1);
  });

// ------------------------------------------------------
// This is required by netlify functions
// ------------------------------------------------------
if (isProduction) {
  if (isNetlify) {
    app.use('/.netlify/functions/app', router);
  } else {
    app.use(compression());
    app.use(router);
    app.use(express.static(path.resolve(__dirname, '../../build'), { maxAge: '365d', index: false }));
    app.get('*', nocache(), (req, res) => {
      res.send(fs.readFileSync(path.resolve(__dirname, '../../build/index.html')).toString());
    });
  }
  app.use((req, res) => {
    res.status(404).send('404 NOT FOUND');
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
} else {
  app.use(router);
}

// Make it serverless
exports.handler = serverless(app);
exports.server = server;
