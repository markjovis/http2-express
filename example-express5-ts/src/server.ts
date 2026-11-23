import express from 'express';
import http2 from 'http2';
import fs from 'fs';

import http2Express from '../../src';

const app = http2Express(express);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const options: http2.SecureServerOptions = {
  key: fs.readFileSync('certs/server-key.pem'),
  cert: fs.readFileSync('certs/server-cert.pem'),
  passphrase: 'Test123',
  allowHTTP1: false
};

const server = http2.createSecureServer(options, app);

server.listen(44320, () => {
  console.info('Listening on port 44320...');
});
