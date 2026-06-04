const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"] }
  }
});

module.exports = { limiter, securityHeaders };
