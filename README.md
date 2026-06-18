# http2-express
This package adds HTTP/2 support to express.js applications.

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

**NOTICE**: This package is fully compatible with the old [http2-express-bridge](https://www.npmjs.com/package/http2-express-bridge). You should be able to replace the old package [http2-express-bridge](https://www.npmjs.com/package/http2-express-bridge) with this new one ("**http2-express**") without changing anything in your code, except the package name in the import (see usage below).

## Installation
```bash
npm i http2-express
```

**Notice**: It is recommended to use Node.js **version 19** or higher.

    
## Usage
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

ESModule "import" syntax is also supported.

**NOTICE**: While the old [http2-express-bridge](https://www.npmjs.com/package/http2-express-bridge) provided support for Server Push, this package does not support Server Push because all major browsers and HTTP/2 Clients no longer support it. For example, Server Push has been disable in Chrome since version 106. The reason behind it is that Server Push did not provide significant performance gains, and in many cases, the performance actually decreased.

