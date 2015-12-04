import {printError} from '../print';
import {remove} from '../request';
import Bluebird from 'bluebird';

export default function safeDelete(activeWorkspace, hostname, filename) {
  if (!hostname) {
    printError('You have to call init-session first!');
    return Bluebird.resolve();
  }

  return remove(activeWorkspace, hostname, '/document', {documentId: filename})
    .then((data) => {
      console.log(JSON.parse(data.body).message);
    })
    .catch((err) => {
      printError(err.message);
    });
}
