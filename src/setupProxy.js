const proxy = require('http-proxy-middleware');
const env = require('./libs/env');

module.exports = app => {
  app.use(proxy('/api', { target: env.baseUrl }));
};
