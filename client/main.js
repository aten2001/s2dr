import fs from 'fs';
import https from 'https';
import path from 'path';

// makes our self-signed certificated trusted and prevents throwing errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var options = {
  hostname: 'localhost',
  port: 4433,
  path: '/',
  method: 'GET',
  ca: fs.readFileSync(path.join(__dirname, '../ca/ca-crt.pem'))
};

var req = https.request(options, (res) => {
  res.on('data', function(data) {
    process.stdout.write(data);
  });
});

req.end();
