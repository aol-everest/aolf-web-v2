const next = require("next");
const express = require("express");
const helmet = require("helmet");
const sslRedirect = require("heroku-ssl-redirect").default; // to make it work with 'require' keyword.

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Express's middleware to automatically redirect to 'https'.
  server.use(sslRedirect());
  server.disable("x-powered-by");
  // server.use(helmet.contentSecurityPolicy());
  // server.use(helmet.crossOriginEmbedderPolicy());
  server.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": [
            "*",
            "'self'",
            "data:",
            "mediastream:",
            "blob:",
            "filesystem:",
            "about:",
            "ws:",
            "wss:",
            "'unsafe-eval'",
            "'wasm-unsafe-eval'",
            "'unsafe-inline'",
          ],
          "style-src": [
            "'self'",
            "'unsafe-inline'",
            "*.googleapis.com",
            "cdn.jsdelivr.net",
          ],
          "font-src": [
            "'self'",
            "'unsafe-inline'",
            "data:",
            "*.gstatic.com",
            "*.googleapis.com",
          ],
          "frame-ancestors": [
            "'self'",
            "artofliving.org",
            "*.artofliving.org",
            "*.unbounce.com",
            "*.unbouncepreview.com",
          ],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;

    console.log(`Server starts on ${PORT}.`);
  });
});
