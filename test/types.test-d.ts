// Compile-time checks for src/index.d.ts. Run with `npm run typecheck`.
import express from 'express';
import http2 from 'http2';
import http2Express from '../src';
import { default as namedDefault } from '../src';

const app = http2Express(express);
app.get('/', (req, res) => {
  res.send(req.hostname);
});
app.use(express.json());

http2.createServer(app);
http2.createSecureServer({ allowHTTP1: false }, app);
app.listen(0);
namedDefault(express);

// @ts-expect-error - must be given the express module
http2Express('express');
// @ts-expect-error - still a typed Express app
app.doesNotExist();
