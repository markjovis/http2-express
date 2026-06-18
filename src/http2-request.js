'use strict';

const { Http2ServerRequest } = require('http2');

const createHttp2Request = (request) => {
  const http2Request = Object.create(Http2ServerRequest.prototype);

  // Copying properties and descriptors from request to http2Request.
  Object.getOwnPropertyNames(request).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(request, key);
    if (descriptor) {
      Object.defineProperty(http2Request, key, descriptor);
    }
  });

  // Retain symbols, if any, from request.
  Object.getOwnPropertySymbols(request).forEach((symbol) => {
    const descriptor = Object.getOwnPropertyDescriptor(request, symbol);
    if (descriptor) {
      Object.defineProperty(http2Request, symbol, descriptor);
    }
  });

  // The hostname getter from Express reads this.headers['host'].
  // HTTP/2 requests carry the host via the :authority pseudo-header instead,
  // so initHttp2Express populates headers['host'] from req.authority before
  // any route handlers run. No getter override needed here.

  return http2Request;
};

module.exports = createHttp2Request;
