var fs = require('fs');
/* fs.readFile('./test.json', (err, data) => {
  // 简单的请求文件
  console.log(data);
}); */

var http = require('http'); // http服务器简单的响应示例
/* http
  .createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('Hello Worl444d\n');
  })
  .listen(3001);
console.log('server running at http://localhost:3001/'); */

/* var server = http.createServer();
server.on('request', (req, res) => {
  // request 事件监听器
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end('<h1>Hello World</h1>');
});
server.listen(3001);
console.log('server running at http://localhost:3001/');

var stream = fs.createReadStream('./test.json');
stream.on('data', chunk => {
  console.log(chunk);
});
stream.on('end', () => {
  console.log('finish');
}); */

http
  .createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'image/png' });
    fs.createReadStream('./p7-1.png').pipe(res);
  })
  .listen(3000);
console.log('server running at http://localhost:3000/');
