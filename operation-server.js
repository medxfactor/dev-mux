const http = require('http');
const FindMyWay = require('find-my-way');
const { EVENTS } = require('./constants');


function OperationServer(eventEmitter) {
  const router = FindMyWay({
    ignoreTrailingSlash: true
  });

  router.on('PUT', '/add-me', (request, response, params) => {
    const requestData = [];
    request.on('data', (chunk) => {
      requestData.push(chunk);
    });
    request.on('end', () => {
      response.setHeader('Content-Type', 'application/json');
      try {
        const payload = JSON.parse(requestData);
        eventEmitter.emit(EVENTS.ADD_SERVER, payload);
        response.statusCode = 204;
        response.end('');
      } catch (error) {
        response.statusCode = 500;
        response.end(`{"message": "error parsing request body"}`);
      }
    });
  });

  const server = http.createServer(function requestHandler(request, response) {
    router.lookup(request, response);
  });

  return {
    start(host, port, callback) {
      server.listen(port, host, callback);
    },
    stop() {
      server.close();
    }
  }
}

module.exports = {
  OperationServer,
}
