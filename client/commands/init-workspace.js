import exec from 'sync-exec';
import fs from 'fs';
import {printInfo} from '../print';

export default function initWorkspace(username) {
  if (fs.existsSync(`workspaces/${username}/.ssl/crt.pem`)) {
    printInfo(`Workspace ${username} selected.`);
    return;
  }
  exec(`mkdir workspaces/${username}`);
  exec(`mkdir workspaces/${username}/.ssl`);
  exec(`openssl genrsa -out workspaces/${username}/.ssl/key.pem 4096`);
  exec(`openssl req -new -subj '/CN=${username}/O=Georgia Tech./OU=client/C=US' -key workspaces/${username}/.ssl/key.pem -out workspaces/${username}/.ssl/csr.pem`);
  exec(`openssl x509 -req -days 999 -passin "pass:password" -in workspaces/${username}/.ssl/csr.pem -CA ca/ca-crt.pem -CAkey ca/ca-key.pem -CAcreateserial -out workspaces/${username}/.ssl/crt.pem`);
  printInfo(`Workspace ${username} created and selected.`);
}
