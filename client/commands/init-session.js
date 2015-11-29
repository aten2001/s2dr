import fs from 'fs';
import path from 'path';
import {printError} from '../print';
import rp from 'request-promise';

export default function initSession(activeWorkspace, hostname) {
  if (!activeWorkspace) {
    printError('You have to call init-workspace first!');
    return;
  }

  const options = {
    uri: hostname,
    method: 'GET',
    key: fs.readFileSync(path.join(__dirname, '../../workspaces', activeWorkspace, '.ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../../workspaces', activeWorkspace, '.ssl/crt.pem')),
    ca: fs.readFileSync(path.join(__dirname, '../../ca/ca-crt.pem'))
  };

  rp(options)
    .then((data) => {
      process.stdout.write(data);
    })
    .catch((e) => {
      printError(e);
      return;
    });
}
