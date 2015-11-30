import path from 'path';
import fs from 'fs';
import {printError, printInfo} from '../print';
import {get} from '../request';

export default function checkOut(activeWorkspace, hostname, filename, newname) {
  if (!activeWorkspace) {
    printError('You have to call init-workspace first!');
    return;
  }

  const filePath = path.join(__dirname, '../../workspaces', activeWorkspace, newname);

  get(
    activeWorkspace,
    hostname,
    '/document',
    {documentId: filename}
  )
  .then((data) => {
    fs.writeFile(filePath, data.body, 'binary', (err) => {
      if (err) {
        printError(err);
      } else {
        printInfo(`Document ${filename} was saved to ${filePath}`);
      }
    });
  })
  .catch((err) => {
    printError(err.message);
  });
}
