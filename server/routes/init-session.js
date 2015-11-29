import storage from 'node-persist';
import sanitize from 'sanitize-filename';

export default function initSession(req, res) {
  const username = sanitize(req.socket.getPeerCertificate().subject.CN);
  const fingerprint = req.socket.getPeerCertificate().fingerprint;
  const users = storage.getItemSync('users');
  const result = users.find(user => user.id === username);

  if (result) {
    if (result.fingerprint === fingerprint) {
      res.json({message: `Welcome back ${username}! Secure channel is ready!`});
    } else {
      res.status(403).json({
        message: `Your certificate username doesn't match the public key that was already used with this username.`
      });
    }
  } else {
    storage.setItemSync('users', users.concat([{
      id: username,
      fingerprint: fingerprint
    }]));
    res.json({message: `Welcome ${username} for the first time! Secure channel is ready!`});
  }

}
