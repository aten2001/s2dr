import path from 'path';
import fs from 'fs';
import {printError} from '../print';
import {post} from '../request';
import FormData from 'form-data';
import Bluebird from 'bluebird';

export default function checkIn(activeWorkspace, hostname, filename, securityFlag, updateWatchList) {
  if (!hostname) {
    printError('You have to call init-session first!');
    return Bluebird.resolve();
  }

  if (['CONFIDENTIALITY', 'INTEGRITY', 'NONE', 'BOTH', 'UPDATE'].indexOf(securityFlag.toUpperCase()) === -1) {
    printError(`SecurityFlag can be set to CONFIDENTIALITY, INTEGRITY, BOTH or NONE. Not to ${securityFlag}.`);
    return Bluebird.resolve();
  }

  const filePath = path.join(__dirname, '../../workspaces', activeWorkspace, filename);

  if (!fs.existsSync(filePath)) {
    printError(`File ${filePath} was not found.`);
    return Bluebird.resolve();
  }

  let form = new FormData();
  form.append('securityFlag', securityFlag.toUpperCase());
  form.append('document', fs.createReadStream(filePath));

  return form.pipe(post(
    activeWorkspace,
    hostname,
    '/document',
    null,
    form.getHeaders()
  )).then((data) => {
    console.log(JSON.parse(data.body).message);
    if (data.statusCode === 200) {
      updateWatchList(filename);
    }
  })
  .catch((err) => {
    printError(err.message);
  });
};
