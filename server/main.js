import fs from 'fs';
import https from 'https';
import path from 'path';

const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/server-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/server-crt.pem')),
  ca: fs.readFileSync(path.join(__dirname, '../ca/ca-crt.pem')),
  requestCert: true,
  rejectUnauthorized: false
};

console.log('Server is running at https://localhost:4433 ...');

https.createServer(options, (req, res) => {
  console.log(new Date() + ' ' +
    req.connection.remoteAddress + ' ' +
    req.method + ' ' + req.url);
  res.writeHead(200);
  res.end('some valid response\n');
}).listen(4433);
