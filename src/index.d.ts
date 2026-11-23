import type { Http2ServerRequest, Http2ServerResponse } from 'http2';

/**
 * Request listener signature used by `http2.createServer()` and
 * `http2.createSecureServer()`.
 */
type Http2RequestListener = (req: Http2ServerRequest, res: Http2ServerResponse) => void;

/**
 * An Express application (as created by `express()`) that can also be passed
 * directly to `http2.createServer()` / `http2.createSecureServer()` as the
 * request listener. All the usual Express members (`get`, `use`, `listen`,
 * `set`, ...) remain available.
 */
type Http2ExpressApplication<App> = App & Http2RequestListener;

/**
 * Creates an Express application with HTTP/2 support.
 *
 * Works with both Express 4 and Express 5. The returned application type comes
 * from the `express` module you pass in, so it follows whichever
 * `@types/express` version your project uses.
 *
 * @param express The `express` module itself (not the result of calling it).
 * @returns An Express application usable as an `http2` server request listener.
 *
 * @example
 * import express from 'express';
 * import http2 from 'http2';
 * import http2Express from 'http2-express';
 *
 * const app = http2Express(express);
 * const server = http2.createSecureServer({ key, cert }, app);
 */
declare function http2Express<App>(express: () => App): Http2ExpressApplication<App>;

declare namespace http2Express {
  export { http2Express as default, Http2ExpressApplication, Http2RequestListener };
}

export = http2Express;
