'use strict';

const { isHttp2Request, setPoweredBy } = require('./util');

/**
 * Creates the Express middleware that swaps the request/response prototypes to
 * the HTTP/2 or HTTP/1 variants.
 * @param {any} app The HTTP/2-enabled Express application.
 * @returns {(req: any, res: any, next: (err?: unknown) => void) => void}
 */
const initHttp2Express = (app) => (req, res, next) => {
  setPoweredBy(app, res);
  req.res = res;
  res.req = req;
  req.next = next;

  try {
    if (isHttp2Request(req)) {
      // HTTP/2 uses :authority instead of the Host header. Populate headers['host']
      // once, upfront, so that Express's req.hostname getter and any middleware
      // that reads req.headers directly see a consistent value from the start.
      if (!req.headers['host'] && req.authority) {
        req.headers['host'] = req.authority;
      }
      Object.setPrototypeOf(req, app.http2Request);
      Object.setPrototypeOf(res, app.http2Response);
    } else {
      Object.setPrototypeOf(req, app.request);
      Object.setPrototypeOf(res, app.response);
    }
  } catch (err) {
    return next(err);
  }

  res.locals = res.locals || Object.create(null);
  next();
};

module.exports = initHttp2Express;
