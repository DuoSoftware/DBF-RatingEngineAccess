const restify = require('restify'),
  config = require('config'),
  jwt = require('restify-jwt'),
  secret = require('dvp-common-lite/Authentication/Secret.js'),
  authorization = require('dvp-common-lite/Authentication/Authorization.js'),
  workflow = require('./worker/workflow');

const port = (config.Host)? config.Host.port: 3000;

const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0].toLowerCase() === 'bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if (req.params && req.params.Authorization) {
    return req.params.Authorization;
  } else if (req.query && req.query.Authorization) {
    return req.query.Authorization;
  }

  return null;
}

const server = restify.createServer({
  name: "RatingEngineAccess"
});

server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.bodyParser({ mapParams: true }));

server.listen(port, () => {
  console.log('%s listening at %s', server.name, server.url);
});

// POST http://localhost/DBF/API/v2/tenants/cookiemonster/workflows?criteria=tenant
server.post(
  '/DBF/API/:version/tenants/:tenant/workflows',
  jwt({secret: secret.Secret, getToken: getToken}),
  authorization({resource: "user", action: "write"}),
  workflow.save
);

// DELETE http://localhost/DBF/API/v2/tenants/cookiemonster/workflows?criteria=tenant
server.del(
  '/DBF/API/:version/tenants/:tenant/workflows',
  authorization({resource: "sla", action: "delete"}),
  workflow.remove
);

