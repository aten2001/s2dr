import fs from 'fs';
import path from 'path';
import storage from 'node-persist';
import sanitize from 'sanitize-filename';
import exec from 'sync-exec';
import isAllowed from '../is-allowed';

export default function checkIn(req, res) {
  const filename = sanitize(req.file.originalname);
  const username = sanitize(req.socket.getPeerCertificate().subject.CN);
  let securityFlag = req.body.securityFlag;

  if (securityFlag === 'UPDATE') {
    if (storage.getItemSync('documents').some(doc => doc.id === filename)) {
      securityFlag = storage.getItemSync('documents').find(doc => doc.id === filename).securityFlag;
    } else {
      securityFlag = 'NONE';
    }
  }

  if (['CONFIDENTIALITY', 'INTEGRITY', 'BOTH', 'NONE'].indexOf(securityFlag) === -1) {
    res.status(400).json({
      message: `SecurityFlag can be set to CONFIDENTIALITY, INTEGRITY, BOTH or NONE. Not to ${securityFlag}`
    });
    return;
  }

  const key = genKey();
  const filePath = path.join(__dirname, '../documents', req.file.filename);

  if (storage.getItemSync('documents').some(doc => doc.id === filename) &&
      !isAllowed(username, filename, 'checking-in')) {
    fs.unlinkSync(filePath);
    res.status(400).json({
      message: `This file already exists on the server and you don't have checking-in permission.`
    });
    return;
  }

  if (securityFlag === 'CONFIDENTIALITY' || securityFlag === 'BOTH') {
    exec(`openssl enc -in ${filePath} -out ${filePath}${filename}.aes -e -aes256 -k ${key}`);
    fs.unlinkSync(filePath);
  } else {
    fs.renameSync(filePath, filePath + filename);
  }

  if (securityFlag === 'INTEGRITY' || securityFlag === 'BOTH') {
    exec(`openssl dgst -sha256 ${filePath}${filename}` + (securityFlag === 'BOTH' ? '.aes' : '') + ` > server/documents/${req.file.filename}_hash`);
    exec(`openssl rsautl -sign -inkey server/ssl/server-key.pem -keyform PEM -in server/documents/${req.file.filename}_hash > server/documents/${req.file.filename}${filename}.signature`);
    exec(`rm server/documents/${req.file.filename}_hash`);
  }

  const docs = storage.getItemSync('documents');
  const result = docs.find(doc => doc.id === filename);
  const newFile = {
    id: filename,
    filename: req.file.filename + filename,
    ownerId: result ? result.ownerId : username,
    securityFlag: securityFlag,
    mimetype: req.file.mimetype,
    key: (securityFlag === 'CONFIDENTIALITY' || securityFlag === 'BOTH') ? key : ''
  };

  if (result) {
    if (result.securityFlag === 'CONFIDENTIALITY' || result.securityFlag === 'BOTH') {
      fs.unlinkSync(path.join(__dirname, '../documents', result.filename + '.aes'));
    } else if (result.securityFlag === 'INTEGRITY') {
      fs.unlinkSync(path.join(__dirname, '../documents', result.filename));
      fs.unlinkSync(path.join(__dirname, '../documents', result.filename + '.signature'));
    } else {
      fs.unlinkSync(path.join(__dirname, '../documents', result.filename));
    }
    storage.setItemSync('documents', docs.filter(doc => doc.id !== result.id).concat([newFile]));
    res.json({
      message: `Document ${filename} was successfully updated!`
    });
  } else {
    storage.setItemSync('documents', docs.concat([newFile]));
    res.json({
      message: `Document ${filename} was successfully uploaded!`
    });
  }
}

function genKey() {
  let key = '';
  const hex = '0123456789abcdef';

  for (let i = 0; i < 64; i += 1) {
    key += hex.charAt(Math.floor(Math.random() * 16));
  }
  return key;
}
