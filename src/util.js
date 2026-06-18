'use strict';

exports.setPoweredBy = (app, res) => {
  if (app.enabled('x-powered-by')) {
    res.setHeader('X-Powered-By', 'HTTP/2 Express (http2-express)');
  }
};

// Using optional chaining so a destroyed/reset stream never throws TypeError.
// req.stream?.session?.alpnProtocol returns undefined (not a crash) when the
// stream or session has already been closed.
exports.isHttp2Request = (req) => {
  if (req.httpVersion !== '2.0') return false;
  const alpnProtocol = req.stream?.session?.alpnProtocol;
  return alpnProtocol === 'h2' || alpnProtocol === 'h2c';
};
