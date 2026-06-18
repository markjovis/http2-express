'use strict';

const EventEmitter = require('events');

const createHttp2Request = require('./http2-request');
const createHttp2Response = require('./http2-response');
const initHttp2Express = require('./init-http2-express');
const { setPoweredBy, isHttp2Request } = require('./util');

const createHttp2Express = (express) => {
  const {
    application,
    request,
    response,
    Router,
    query
  } = express;

  // Detect Express 5 via the version string (positive-space check) with a
  // fallback to the absence-of-lazyrouter heuristic for edge cases where
  // express.version is unavailable.
  const isExpress5 = express.version
    ? parseInt(express.version, 10) >= 5
    : typeof application.lazyrouter !== 'function';

  if (isExpress5) {
    const originalInit = application.init;
    application.init = function init() {
      originalInit.call(this);
      this.router.use((req, res, next) => {
        setPoweredBy(this, res);
        // HTTP/2 carries the host in :authority. Populate headers['host'] once,
        // upfront, so Express's req.hostname getter and any header-inspection
        // middleware see a consistent value from the start.
        if (isHttp2Request(req) && !req.headers['host'] && req.authority) {
          req.headers['host'] = req.authority;
        }
        next();
      });
    };
  } else {
    application.lazyrouter = function lazyrouter() {
      if (!this._router) {
        this._router = new Router({
          caseSensitive: this.enabled('case sensitive routing'),
          strict: this.enabled('strict routing')
        });
        this._router.use(query(this.get('query parser fn')));
        this._router.use(initHttp2Express(this));
      }
    };
  }

  // For Express 5: intercept the app.request/app.response reads that happen
  // synchronously at the top of app.handle, so H2 connections get the HTTP/2
  // prototype set immediately — before any stream machinery can run _read().
  // This must happen at the getter level, not in a middleware, because by the
  // time middleware runs the wrong prototype is already set on the request.
  //
  // Safe under Node.js's single-threaded event loop: the overrides are set and
  // consumed within the same synchronous call stack (no await between them and
  // Express 5's prototype reads inside app.handle).
  let oneshotRequestOverride = null;
  let oneshotResponseOverride = null;

  const app = function (req, res, next) {
    if (isExpress5 && isHttp2Request(req)) {
      oneshotRequestOverride = app.http2Request;
      oneshotResponseOverride = app.http2Response;
    }
    app.handle(req, res, next);
  };

  // Copying properties and descriptors from EventEmitter.prototype to app.
  Object.getOwnPropertyNames(EventEmitter.prototype).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(EventEmitter.prototype, key);
    if (descriptor) {
      Object.defineProperty(app, key, descriptor);
    }
  });

  // Copy symbols from EventEmitter.prototype to app.
  Object.getOwnPropertySymbols(EventEmitter.prototype).forEach((symbol) => {
    const descriptor = Object.getOwnPropertyDescriptor(EventEmitter.prototype, symbol);
    if (descriptor) {
      Object.defineProperty(app, symbol, descriptor);
    }
  });

  // Copying properties from application to app.
  Object.getOwnPropertyNames(application).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(application, key);
    if (descriptor) {
      Object.defineProperty(app, key, descriptor);
    }
  });

  // Copy symbols from application to app.
  Object.getOwnPropertySymbols(application).forEach((symbol) => {
    const descriptor = Object.getOwnPropertyDescriptor(application, symbol);
    if (descriptor) {
      Object.defineProperty(app, symbol, descriptor);
    }
  });

  app._request = Object.create(request, {
    app: {
      configurable: true,
      enumerable: true,
      writable: true,
      value: app
    }
  });

  app._response = Object.create(response, {
    app: {
      configurable: true,
      enumerable: true,
      writable: true,
      value: app
    }
  });

  // No-op push on the per-app HTTP/1 response object only.
  app._response.push = () => { };

  const http2Request = createHttp2Request(request);
  const http2Response = createHttp2Response(response);

  app.http2Request = Object.create(http2Request, {
    app: {
      configurable: true,
      enumerable: true,
      writable: true,
      value: app
    }
  });

  app.http2Response = Object.create(http2Response, {
    app: {
      configurable: true,
      enumerable: true,
      writable: true,
      value: app
    }
  });

  // No-op push on the per-app HTTP/2 response object only.
  app.http2Response.push = () => { };

  Object.defineProperty(app, 'request', {
    configurable: true,
    enumerable: true,
    get() {
      if (oneshotRequestOverride) {
        const val = oneshotRequestOverride;
        oneshotRequestOverride = null;
        return val;
      }
      return app._request;
    },
    set(val) { app._request = val; }
  });

  Object.defineProperty(app, 'response', {
    configurable: true,
    enumerable: true,
    get() {
      if (oneshotResponseOverride) {
        const val = oneshotResponseOverride;
        oneshotResponseOverride = null;
        return val;
      }
      return app._response;
    },
    set(val) { app._response = val; }
  });

  app.init();
  return app;
};

module.exports = createHttp2Express;
