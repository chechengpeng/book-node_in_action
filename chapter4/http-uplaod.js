var http = require('http');
var formidalbe = require('formidable');

var server = http.createServer(function(req, res) {
  console.log('req.method', req.method);
  switch (req.method) {
    case 'GET':
      show(res);
      break;
    case 'POST':
      upload(req, res);
      break;
    default:
      badRequest(res);
  }
});

function show(res) {
  var html = `<html><head><title>Upload</title></head></html><body><h1>Upload</h1>
    <form method="post" action="/" enctype="multipart/form-data">
      <p><input type="text" name="item" /> </p>
      <p><input type="file" name="file" /> </p>
      <p><input type="submit" value="upload" /></p>
    </form>
  </body>`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}

function upload(req, res) {
  if (!isFormData(req)) {
    res.statusCode = 400;
    res.end('Bad Request: expecting multipart/form-data');
    return;
  }
  var form = new formidalbe.IncomingForm();
  form.on('field', function(field, value) {
    console.log(field);
    console.log(value);
  });
  form.on('file', function(name, file) {
    console.log(name);
    console.log(file);
  });
  form.on('end', function() {
    res.end('upload complete');
  });
  form.on('progress', function(bytesReceived, bytesExpected) {
    var percent = Math.floor(bytesReceived / bytesExpected * 100);
    console.log(percent);
  });
  form.parse(req);
}

function isFormData(req) {
  var type = req.headers['content-type'] || '';
  return 0 == type.indexOf('multipart/form-data');
}

server.listen(3000);
