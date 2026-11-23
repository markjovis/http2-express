'use strict';

/**
 * Minimal shape of an incoming request that is needed to detect HTTP/2.
 * Satisfied by `http.IncomingMessage` and `http2.Http2ServerRequest`.
 * @typedef {object} RequestLike
 * @property {string} httpVersion
 * @property {{ session?: { alpnProtocol?: string } }} [stream]
 */

/**
 * Sets the `X-Powered-By` header when the app has `x-powered-by` enabled.
 * @param {{ enabled(name: string): boolean }} app An Express application.
 * @param {{ setHeader(name: string, value: string): unknown }} res The response.
 * @returns {void}
 */
exports.setPoweredBy = (app, res) => {
  if (app.enabled('x-powered-by')) {
    res.setHeader('X-Powered-By', 'HTTP/2 Express (http2-express)');
  }
};

// Using optional chaining so a destroyed/reset stream never throws TypeError.
// req.stream?.session?.alpnProtocol returns undefined (not a crash) when the
// stream or session has already been closed.
/**
 * @param {RequestLike} req
 * @returns {boolean} `true` when the request arrived over HTTP/2 (h2 or h2c).
 */
exports.isHttp2Request = (req) => {
  if (req.httpVersion !== '2.0') return false;
  const alpnProtocol = req.stream?.session?.alpnProtocol;
  return alpnProtocol === 'h2' || alpnProtocol === 'h2c';
};
