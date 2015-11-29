import {printError} from '../print';
import {get} from '../request';


export default function initSession(activeWorkspace, hostname) {
  if (!activeWorkspace) {
    printError('You have to call init-workspace first!');
    return;
  }

  get(activeWorkspace, hostname)
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      printError(err);
    });
}
