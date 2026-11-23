// @ts-check
// Compile-time checks for plain JavaScript consumers using JSDoc types (no build step).
// Run with `npm run typecheck`.
const express = require('express');
const http2 = require('http2');
const http2Express = require('../src');

const app = http2Express(express);
app.get('/', (req, res) => {
  res.send(req.hostname);
});

http2.createSecureServer({ allowHTTP1: false }, app);

/** @type {import('../src').Http2ExpressApplication<import('express').Express>} */
const typedApp = http2Express(express);
typedApp.listen(0);

/** @type {import('../src').Http2RequestListener} */
const listener = app;
http2.createServer(listener);

// @ts-expect-error - must be given the express module
http2Express('express');
// @ts-expect-error - still a typed Express app
app.doesNotExist();
