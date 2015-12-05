import path from 'path';
import {printError, printInfo} from '../print';
import {get} from '../request';
import write from 'fs-writefile-promise';
import Bluebird from 'bluebird';

export default function checkOut(activeWorkspace, hostname, filename, newname, updateWatchList) {
  if (!hostname) {
    printError('You have to call init-session first!');
    return Bluebird.resolve();
  }

  const filePath = path.join(__dirname, '../../workspaces', activeWorkspace, newname);

  return get(
    activeWorkspace,
    hostname,
    '/document',
    {documentId: filename}
  )
  .then((data) => {
    write(filePath, data.body, 'binary');
    if (data.statusCode === 200) {
      updateWatchList(filename);
    }
  })
  .then(() => printInfo(`Document ${filename} was saved to ${filePath}`))
  .catch((err) => {
    printError(err.message);
  });
}
