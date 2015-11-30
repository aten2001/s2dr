import fs from 'fs';
import path from 'path';
import storage from 'node-persist';
import sanitize from 'sanitize-filename';
import exec from 'sync-exec';

export default function checkIn(req, res) {
  const filename = sanitize(req.file.originalname);
  const username = sanitize(req.socket.getPeerCertificate().subject.CN);

  if (['CONFIDENTIALITY', 'INTEGRITY', 'NONE'].indexOf(req.body.securityFlag.toUpperCase()) === -1) {
    res.status(400).json({
      message: `SecurityFlag can be set to CONFIDENTIALITY, INTEGRITY or NONE. Not to ${req.body.securityFlag}`
    });
    return;
  }

  const key = genKey();
  const filePath = path.join(__dirname, '../documents', req.file.filename);

  if (req.body.securityFlag.toUpperCase() === 'INTEGRITY') {
    exec(`openssl dgst -sha256 ${filePath} > server/documents/${req.file.filename}_hash`);
    console.log(exec(`openssl rsautl -sign -inkey server/ssl/server-key.pem -keyform PEM -in server/documents/${req.file.filename}_hash > server/documents/${req.file.filename}${filename}.signature`));
    exec(`rm server/documents/${req.file.filename}_hash`);
  }
  if (req.body.securityFlag.toUpperCase() === 'CONFIDENTIALITY') {
    exec(`openssl enc -in ${filePath} -out ${filePath}${filename}.aes -e -aes256 -k ${key}`);
    fs.unlinkSync(filePath);
  } else {
    fs.renameSync(filePath, filePath + filename);
  }

  const docs = storage.getItemSync('documents');
  const result = docs.find(doc => doc.id === filename);
  const newFile = {
    id: filename,
    filename: req.file.filename + filename,
    ownerId: username,
    securityFlag: req.body.securityFlag,
    mimetype: req.file.mimetype,
    key: req.body.securityFlag.toUpperCase() === 'CONFIDENTIALITY' ? key : ''
  };

  if (result) {
    if (req.body.securityFlag.toUpperCase() === 'CONFIDENTIALITY') {
      fs.unlinkSync(path.join(__dirname, '../documents', result.filename, '.aes'));
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
