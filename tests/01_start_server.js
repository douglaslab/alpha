'use strict';

before((done) => {
  var server = require('../server');
  //give the server 1/2 a second to start
  setTimeout(() => {
    process.env.TEST_URL = server.url.replace('[::]', 'localhost');
    done();
  }, 500);
});
