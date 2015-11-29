import path from 'path';
import fs from 'fs';
import {printError} from '../print';
import {post} from '../request';
import FormData from 'form-data';

export default function checkIn(activeWorkspace, hostname, filename, securityFlag) {
  if (!activeWorkspace) {
    printError('You have to call init-workspace first!');
    return;
  }

  if (['CONFIDENTIALITY', 'INTEGRITY', 'NONE'].indexOf(securityFlag.toUpperCase()) === -1) {
    printError(`SecurityFlag can be set to CONFIDENTIALITY, INTEGRITY or NONE. Not to ${securityFlag}`);
    return;
  }

  const filePath = path.join(__dirname, '../../workspaces', activeWorkspace, filename);

  if (!fs.existsSync(filePath)) {
    printError(`File ${filePath} was not found.`);
    return;
  }

  let form = new FormData();
  form.append('securityFlag', securityFlag.toUpperCase());
  form.append('document', fs.createReadStream(filePath));

  post(
    activeWorkspace,
    hostname,
    '/document',
    {securityFlag: securityFlag},
    form
  )
  .then((data) => {
    console.log(JSON.parse(data).message);
  })
  .catch((err) => {
    printError(err);
  });

};
