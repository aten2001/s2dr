import path from 'path';
import {printError, printInfo} from '../print';
import {get} from '../request';
import write from 'fs-writefile-promise';

export default function checkOut(activeWorkspace, hostname, filename, newname) {
  if (!hostname) {
    printError('You have to call init-session first!');
    return;
  }

  const filePath = path.join(__dirname, '../../workspaces', activeWorkspace, newname);

  return get(
    activeWorkspace,
    hostname,
    '/document',
    {documentId: filename}
  )
  .then((data) => write(filePath, data.body, 'binary'))
  .then(() => printInfo(`Document ${filename} was saved to ${filePath}`))
  .catch((err) => {
    printError(err);
  });
}
