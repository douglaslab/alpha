'use strict';

var restify = require('restify');
var config = require('./configs/service');
var server = restify.createServer({
  name: config.name,
  version: config.version
});

//Allow cross origins access
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  return next();
});

//Server helpers
server.use(restify.acceptParser(server.acceptable))
  .use(restify.queryParser())
  .use(restify.bodyParser())
  .use(restify.fullResponse())
  .pre(restify.pre.sanitizePath());

//return message when hitting root
server.get('/', (req, res) => {
  let recentVersion = Array.isArray(server.versions) ? server.versions[server.versions.length - 1] : server.versions;
  res.send({message: 'Welcome to ' + server.name + ' version ' + recentVersion});
});

server.listen(process.env.PORT || 3000, () => {
  console.log('%s listening at %s', server.name, server.url);
});
