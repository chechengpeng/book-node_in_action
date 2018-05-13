var http = require('http');
var items = ['123', '321', 'test'];

var server = http.createServer(function(req, res) {
  if ('/' == req.url) {
    console.log('req.method', req.method);
    switch (req.method) {
      case 'GET':
        show(res);
        break;
      case 'POST':
        add(req, res);
        break;
      default:
        badRequest(res);
    }
  } else {
    notFound(res);
  }
});

function show(res) {
  var html = `<html><head><title>Todo list</title></head></html><body><h1>Todo list</h1>
  <ul>${items
    .map(function(item) {
      return '<li>' + item + '</li>';
    })
    .join('')}</ul>
    <form method="post" action="/">
      <p><input type="number" name="item" /> </p>
      <p><input type="submit" value="add item" /></p>
    </form>
  </body>`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}

function notFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Not Found\n');
}

function badRequest(res) {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Bad Request');
}

var qs = require('querystring');

function add(req, res) {
  var body = '';
  req.setEncoding('utf-8');
  req.on('data', function(chunk) {
    body += chunk;
  });
  req.on('end', function() {
    var obj = qs.parse(body);
    items.push(obj.item);
    show(res);
  });
}

function remove(req, res) {
  var body = '';
  req.setEncoding('utf-8');
  req.on('data', function(chunk) {
    body += chunk;
  });
  req.on('end', function() {
    var obj = qs.parse(body);
    items.splice(+obj.item, 1);
    show(res);
  });
}

server.listen(3000);
