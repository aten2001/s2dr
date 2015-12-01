import {printError} from '../print';
import {post} from '../request';
import Bluebird from 'bluebird';

export default function delegate(activeWorkspace, hostname, filename, client, time, permission, propagationFlag) {
  if (!hostname) {
    printError('You have to call init-session first!');
    return Bluebird.resolve();
  }

  if (['checking-in', 'checking-out', 'both'].indexOf(permission.toLowerCase()) === -1) {
    printError(`Permission can be set to checking-in, checking-out or both. Not to ${permission}`);
    return Bluebird.resolve();
  }

  const propFlag = propagationFlag.toLowerCase() === 'false' ? false : true;
  return post(
    activeWorkspace,
    hostname,
    '/delegation',
    {filename: filename, client: client, time: time, permission: permission, propagationFlag: propFlag}
  ).then((data) => {
    console.log(JSON.parse(data.body).message);
  })
  .catch((err) => {
    printError(err.message);
  });
}
