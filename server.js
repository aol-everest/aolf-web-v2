const next = require("next");
const express = require("express");
const nocache = require("nocache");
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
  server.use(helmet.crossOriginOpenerPolicy());
  server.use(helmet.crossOriginResourcePolicy());
  server.use(helmet.dnsPrefetchControl());
  server.use(helmet.expectCt());
  server.use(helmet.frameguard());
  server.use(helmet.hidePoweredBy());
  server.use(helmet.hsts());
  server.use(helmet.ieNoOpen());
  server.use(helmet.noSniff());
  server.use(helmet.originAgentCluster());
  server.use(helmet.permittedCrossDomainPolicies());
  server.use(helmet.referrerPolicy());
  server.use(helmet.xssFilter());
  // server.use(nocache());

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;

    console.log(`Server starts on ${PORT}.`);
  });
});
