import fs from 'fs';
import https from 'https';
import path from 'path';
import {printError} from '../print';
import url from 'url';

export default function initSession(activeWorkspace, hostname) {
  if (!activeWorkspace) {
    printError('You have to call init-workspace first!');
    return;
  }

  const options = {
    hostname: url.parse(hostname).hostname,
    port: url.parse(hostname).port,
    path: '/',
    method: 'GET',
    key: fs.readFileSync(path.join(__dirname, '../../workspaces', activeWorkspace, '.ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../../workspaces', activeWorkspace, '.ssl/crt.pem')),
    ca: fs.readFileSync(path.join(__dirname, '../../ca/ca-crt.pem'))
  };

  https.request(options, (res) => {
    res.on('data', (data) => {
      process.stdout.write(data);
    });
  })
  .on('error', function(e) {
    printError(e);
    return;
  })
  .end();
}
