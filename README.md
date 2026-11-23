# http2-express
This package adds HTTP/2 support to express.js applications.

**NOTICE**: Replacement for old `http2-express-bridge`: you only change the package name in the import.

**http2-express** is a small package that lets an Express app run on Node's built-in `http2` server. Express is built on the HTTP/1.1 request and response classes and doesn't work with `http2` directly. This package makes the two compatible: you pass it the `express` module, get back a normal Express app, and hand that app to `http2.createSecureServer()` (or `http2.createServer()` for plain h2c).

```javascript
const app = http2Express(express);
http2.createSecureServer(options, app).listen(443);
```
**Limitation**: server push is not supported, because browsers have dropped it (Chrome removed it in version 106).

## Installation
```bash
npm i http2-express
```

**Notice**: It is recommended to use Node.js **version 19** or higher.

## Usage
- [CommonJS (CJS) usage](#common-js-cjs-usage).
- [ES Modules (ESM) usage](#es-modules-esm-usage).
- [TypeScript usage](#typescript-usage).

## Version History
**Version 1.1.2** includes **TypeScript** type definitions (no separate `@types` package needed for http2-express). The package works with both JavaScript and TypeScript, and with Express 4 and Express 5.
<br>
<br>

**Version 1.1.1** Fixes the following bugs:
1. Fixed the crash issue when a stream is already destroyed.
2. Removed the side-effecting hostname getter that mutated this.headers['host']. The host header is now initialized once, upfront, in middleware.
3. Wrapped Object.setPrototypeOf calls in try/catch so errors go to next(err) instead of hanging the request.
4. Express5 detection now uses parseInt(express.version, 10) >= 5 with the old heuristic as fallback. No longer breaks if lazyrouter is monkey-patched.
5. Removed response.push = () => {} which mutated the shared Express prototype; push no-ops are now set only on app._response and app.http2Response.
6. Added headers['host'] initialization in the Express 5 router middleware.
7. If Express is not installed in your project, or your installed Express version is below version 4.0.0, you'll get a warning.
<br>
<br>

**Version 1.1.0** adds support for **EXPRESS 5**. [grainrigi](https://github.com/grainrigi) was able to make the changes necessary to support **EXPRESS 5**.
This version is also backward compatible with Express 4.
<br>
<br>

**Version 1.0.1** fixes an issue with h2c (running HTTP/2 without TLS) as reported by rickardkarlsson. You should now be able to create a non https server (http2.createServer.....) without any issues.
<br>
<br>

## Common JS (CJS) usage
```javascript
const express = require('express');
const http2 = require('http2');
const http2Express = require('http2-express');
const fs = require('fs');

const app = http2Express(express);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const options = {
  key: fs.readFileSync('path to your certificate key'),
  cert: fs.readFileSync('path to your certificate'),
  passphrase: 'your certificate passphrase',
  allowHTTP1: false
};

const server = http2.createSecureServer(options, app);

server.listen(44320, () => {
  console.info('Listening on port 44320...');
});

```
The code above creates an HTTP/2 server. An HTTP/2 server performs better than the older HTTP/1.1.

**Notice**: If option property "allowHTTP1" is set to true, then your server will be backward compatible with HTTP/1.1. If false, then only the new HTTP/2 is supported. Browsers and HTTP Clients that don't support HTTP/2 will error out if "allowHTTP1" is false.


## ES Modules (ESM) usage
The package works in both CommonJS (`require`) and ES module (`import`) projects, with Express 4 and Express 5. In an ESM project (`"type": "module"` in your `package.json`, or `.mjs` files), use a default import:
```javascript
import express from 'express';
import http2 from 'http2';
import fs from 'fs';
import http2Express from 'http2-express';

const app = http2Express(express);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// ES modules have no __dirname; resolve files relative to this module with import.meta.url.
const options = {
  key: fs.readFileSync(new URL('./certs/server-key.pem', import.meta.url)),
  cert: fs.readFileSync(new URL('./certs/server-cert.pem', import.meta.url)),
  passphrase: 'your certificate passphrase',
  allowHTTP1: false
};

const server = http2.createSecureServer(options, app);

server.listen(44320, () => {
  console.info('Listening on port 44320...');
});
```

## TypeScript usage
Type definitions ship with the package. Install the Express and Node.js types alongside it (use the `@types/express` major version that matches your Express version):
```bash
npm i -D typescript @types/node @types/express
```

```typescript
import express from 'express';
import http2 from 'http2';
import fs from 'fs';
import http2Express from 'http2-express';

const app = http2Express(express);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const options: http2.SecureServerOptions = {
  key: fs.readFileSync('path to your certificate key'),
  cert: fs.readFileSync('path to your certificate'),
  passphrase: 'your certificate passphrase',
  allowHTTP1: false
};

const server = http2.createSecureServer(options, app);

server.listen(44320, () => {
  console.info('Listening on port 44320...');
});
```
`http2Express(express)` returns your regular, fully typed Express application (typed by whichever `@types/express` version you have installed) that can also be passed straight to `http2.createServer()` / `http2.createSecureServer()`. `esModuleInterop` must be enabled for the default `import` form above (it is on by default in current TypeScript); otherwise use `import http2Express = require('http2-express');`.
<br>
<br>

## JSDoc type checking in JavaScript (no build step)
In plain JavaScript ESM or CJS, add `// @ts-check` at the top of a file (or `"checkJs": true` in a `jsconfig.json`) and your editor (VS Code, WebStorm, ...) or `tsc --noEmit` will check your code against the bundled type definitions. Nothing is compiled; the JavaScript runs as-is. This works the same in CommonJS (`require`) and ES module (`import`) files.
```javascript
// @ts-check
const express = require('express');
const http2 = require('http2');
const http2Express = require('http2-express');

// The type is inferred automatically: your Express app, plus the HTTP/2 request listener signature.
const app = http2Express(express);

app.get('/', (req, res) => {
  res.send('Hello World!'); // req and res are fully typed; a typo like res.sendd() is flagged
});

const server = http2.createServer(app);
```
You normally don't need to write any type annotations, because the types are inferred as shown above.

Optional: if you pass the app to a function in another place, TypeScript can't infer the parameter's type, so describe it with a JSDoc `@param`. This continues the example above and uses the same `app`:
```javascript
/**
 * The import(...) below is only a JSDoc type reference (it is not a runtime import),
 * so it also works in CommonJS files that use require().
 * @param {import('http2-express').Http2ExpressApplication<import('express').Express>} application
 */
function registerHealthRoute(application) {
  application.get('/health', (req, res) => {
    res.send('ok'); // req and res are typed here too
  });
}

registerHealthRoute(app); // `app` from the example above
```
The same `@types/express` / `@types/node` dev dependencies listed above are needed for editor/`tsc` checking. If you use TypeScript 7 and your project contains the npm `punycode` package, add `"maxNodeModuleJsDepth": 0` to your `jsconfig.json` to stop it from checking JavaScript inside `node_modules`.

The package's own source is annotated with JSDoc too, and `npm run typecheck` checks it, together with the type tests in `test/`.

## Examples
Complete working examples are in these [github](https://github.com/markjovis/http2-express) folders (each is a standalone project; run it with `npm start`, or check its types with `npm run typecheck`):

| Folder | Language | Module system |
| --- | --- | --- |
| `example-express4-cjs`, `example-express5-cjs` | JavaScript (with `// @ts-check` and a `jsconfig.json`) | CommonJS (`require`) |
| `example-express4-esm`, `example-express5-esm` | JavaScript (with `// @ts-check` and a `jsconfig.json`) | ES modules (`import`) |
| `example-express4-ts`, `example-express5-ts` | TypeScript | compiled/run as CommonJS |
