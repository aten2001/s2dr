import exec from 'sync-exec';

export default function initWorkspace(username) {
  exec(`mkdir workspaces/${username}`);
  exec(`mkdir workspaces/${username}/.ssl`);
  exec(`openssl genrsa -out workspaces/${username}/.ssl/key.pem 4096`);
  exec(`openssl req -new -subj '/CN=${username}/O=Georgia Tech./OU=client/C=US' -key workspaces/${username}/.ssl/key.pem -out workspaces/${username}/.ssl/csr.pem`);
  exec(`openssl x509 -req -days 999 -passin "pass:password" -in workspaces/${username}/.ssl/csr.pem -CA ca/ca-crt.pem -CAkey ca/ca-key.pem -CAcreateserial -out workspaces/${username}/.ssl/crt.pem`);
}
