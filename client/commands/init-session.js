import {printError} from '../print';
import {get} from '../request';


export default function initSession(activeWorkspace, hostname) {
  return get(activeWorkspace, hostname, '/init')
    .then((data) => {
      console.log(JSON.parse(data.body).message);
    })
    .catch((err) => {
      printError(err.message);
    });
}
