import fs from 'fs';
import path from 'path';
import storage from 'node-persist';
import sanitize from 'sanitize-filename';

export default function checkIn(req, res) {
  const filename = sanitize(req.file.originalname);
  const username = sanitize(req.socket.getPeerCertificate().subject.CN);

  if (['CONFIDENTIALITY', 'INTEGRITY', 'NONE'].indexOf(req.body.securityFlag.toUpperCase()) === -1) {
    res.status(400).json({
      message: `SecurityFlag can be set to CONFIDENTIALITY, INTEGRITY or NONE. Not to ${req.body.securityFlag}`
    });
    return;
  }

  const docs = storage.getItemSync('documents');
  const result = docs.find(doc => doc.id === filename);
  const newFile = {
    id: filename,
    filename: req.file.filename,
    ownerId: username,
    securityFlag: req.body.securityFlag,
    key: ''
  };

  if (result) {
    fs.unlinkSync(path.join(__dirname, '../documents', result.filename));
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
