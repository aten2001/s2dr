import path from 'path';
import storage from 'node-persist';
import sanitize from 'sanitize-filename';
import exec from 'sync-exec';
import fs from 'fs';

export default function checkOut(req, res) {
  const username = sanitize(req.socket.getPeerCertificate().subject.CN);
  const documentId = sanitize(req.query.documentId);
  const docs = storage.getItemSync('documents');
  const result = docs.find(doc => doc.id === documentId && doc.ownerId === username);
  if (result) {
    res.type(result.mimetype);
    if (result.securityFlag === 'CONFIDENTIALITY') {
      exec(`openssl enc -in server/documents/${result.filename}.aes -out server/documents/${result.filename} -d -aes256 -k ${result.key}`);
      const filePath = path.join(__dirname, '../documents', result.filename);
      res.sendFile(filePath, () => {
        fs.unlinkSync(filePath);
      });
    } else if (result.securityFlag === 'INTEGRITY') {
      const filePath = path.join(__dirname, '../documents', result.filename);
      const hashFile = parseHash(exec(`openssl dgst -sha256 ${filePath}`));
      const hashSign = parseHash(exec(`openssl rsautl -verify -inkey server/ssl/server-key.pem -keyform PEM -in ${filePath}.signature`));
      if (hashFile === hashSign) {
        res.sendFile(filePath);
      } else {
        res.status(400).json({
          message: `Document ${documentId} lost its integrity.`
        });
      }
    } else {
      const filePath = path.join(__dirname, '../documents', result.filename);
      res.sendFile(filePath);
    }
  } else {
    res.status(400).json({
      message: `Document ${documentId} doesn't exist or you don't have right to check it out.`
    });
  }
}

function parseHash(output) {
  return output.stdout.split('= ')[1];
}
