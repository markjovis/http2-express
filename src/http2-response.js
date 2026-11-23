'use strict';

const { Http2ServerResponse } = require('http2');

/**
 * Builds an HTTP/2 flavoured copy of Express's `response` prototype.
 * @param {object} response Express's `response` prototype object.
 * @returns {import('http2').Http2ServerResponse} The HTTP/2 response prototype.
 */
const createHttp2Response = (response) => {
  /** @type {any} */
  const http2Response = Object.create(Http2ServerResponse.prototype);

  // Copying properties and descriptors from response to http2Response.
  Object.getOwnPropertyNames(response).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(response, key);
    if (descriptor) {
      Object.defineProperty(http2Response, key, descriptor);
    }
  });

  // Copy symbols from response to http2Response.
  Object.getOwnPropertySymbols(response).forEach((symbol) => {
    const descriptor = Object.getOwnPropertyDescriptor(response, symbol);
    if (descriptor) {
      Object.defineProperty(http2Response, symbol, descriptor);
    }
  });

  return http2Response;
};

module.exports = createHttp2Response;
