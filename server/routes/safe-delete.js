import path from 'path';
import storage from 'node-persist';
import sanitize from 'sanitize-filename';
import fs from 'fs';
import isAllowed from '../is-allowed';

export default function safeDelete(req, res) {
  const username = sanitize(req.socket.getPeerCertificate().subject.CN);
  const filename = sanitize(req.query.documentId);

  if (!storage.getItemSync('documents').some(doc => doc.id === filename) ||
      !isAllowed(username, filename, 'checking-in')) {
    res.status(400).json({
      message: `This file doesn't exist or you don't have checking-in permission.`
    });
    return;
  }

  const file = storage.getItemSync('documents').find(doc => doc.id === filename);
  if (file.securityFlag === 'CONFIDENTIALITY') {
    fs.unlinkSync(path.join(__dirname, '../documents', file.filename + '.aes'));
  } else if (file.securityFlag === 'INTEGRITY') {
    fs.unlinkSync(path.join(__dirname, '../documents', file.filename));
    fs.unlinkSync(path.join(__dirname, '../documents', file.filename + '.signature'));
  } else {
    fs.unlinkSync(path.join(__dirname, '../documents', file.filename));
  }

  storage.setItemSync('delegations', storage.getItemSync('delegations').filter(d => d.documentId !== filename));
  storage.setItemSync('documents', storage.getItemSync('documents').filter(d => d.id !== filename));
  res.json({message: `The document ${filename} was safely deleted!`});
}
