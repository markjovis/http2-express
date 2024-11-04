const express = require('express');
const http2 = require('http2');
const fs = require('fs');

const http2Express = require('../../dist');

const app = http2Express(express);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const options = {
  key: fs.readFileSync('certs/server-key.pem'),
  cert: fs.readFileSync('certs/server-cert.pem'),
  passphrase: 'Test123',
  allowHTTP1: false
};

const server = http2.createSecureServer(options, app);

server.listen(44320, () => {
  console.info('Listening on port 44320...');
});
