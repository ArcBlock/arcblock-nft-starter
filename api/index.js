/* eslint-disable no-console */
require('dotenv').config();

const env = require('./libs/env');
const { name, version } = require('../package.json');
const { server } = require('./functions/app');

const port = parseInt(process.env.PORT, 10) || parseInt(process.env.APP_PORT, 10) || 3000;
server.listen(port, err => {
  if (err) throw err;
  console.log(`> ${name} v${version} ready on ${env.baseUrl}`);
});
