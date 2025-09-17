exports.setPoweredBy = (app, res) => {
  if (app.enabled('x-powered-by')) {
    res.setHeader('X-Powered-By', 'HTTP/2 Express (http2-express)');
  }
}

exports.isHttp2Request = (req) => {
  const alpnProtocol = req.httpVersion === '2.0' ? req.stream.session.alpnProtocol : 'h1';
  return alpnProtocol && (alpnProtocol === 'h2' || alpnProtocol === 'h2c');
}