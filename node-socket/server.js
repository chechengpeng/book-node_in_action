var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var chatServer = require('./lib/chat_server');
var cache = {};

var send404 = response => {
  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.write('Error 404: resource not found');
  response.end();
};

var sendFile = (response, filePath, fileContent) => {
  response.writeHead(200, {
    'content-type': mime.lookup(path.basename(filePath))
  });
  response.end(fileContent);
};

var serverStatic = (response, cache, absPath) => {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, exists => {
      if (exists) {
        fs.readFile(absPath, (err, data) => {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
};

var server = http.createServer((request, response) => {
  var filePath = false;
  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = `public${request.url}`;
  }
  var absPath = `./${filePath}`;
  serverStatic(response, cache, absPath);
});
chatServer.listen(server);
server.listen(3000, () => {
  console.log('Server listening on port 3000.');
});
