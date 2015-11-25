import fs from 'fs';
import https from 'https';
import path from 'path';
//import openssl from 'openssl-wrapper';

export default function initSession(hostname) {
  console.log(hostname);

  var options = {
    hostname: 'localhost',
    port: 4433,
    path: '/',
    method: 'GET',
    ca: fs.readFileSync(path.join(__dirname, '../../ca/ca-crt.pem'))
  };

  var req = https.request(options, (res) => {
    res.on('data', function(data) {
      process.stdout.write(data);
    });
  });

  req.end();
}
