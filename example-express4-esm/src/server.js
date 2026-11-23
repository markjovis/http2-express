// @ts-check
import express from 'express';
import http2 from 'http2';
import fs from 'fs';

// In a real project use: import http2Express from 'http2-express';
// (ES modules require the full file name, including the extension, for relative imports.)
import http2Express from '../../src/index.js';

const app = http2Express(express);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// ES modules have no __dirname, so resolve the certificates relative to this
// file with import.meta.url (fs accepts URL objects).
const options = {
  key: fs.readFileSync(new URL('../certs/server-key.pem', import.meta.url)),
  cert: fs.readFileSync(new URL('../certs/server-cert.pem', import.meta.url)),
  passphrase: 'Test123',
  allowHTTP1: false
};

const server = http2.createSecureServer(options, app);

server.listen(44320, () => {
  console.info('Listening on port 44320...');
});
