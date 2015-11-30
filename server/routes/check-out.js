import path from 'path';
import storage from 'node-persist';
import sanitize from 'sanitize-filename';

export default function checkOut(req, res) {
  const username = sanitize(req.socket.getPeerCertificate().subject.CN);
  const documentId = sanitize(req.query.documentId);
  const docs = storage.getItemSync('documents');
  const result = docs.find(doc => doc.id === documentId && doc.ownerId === username);
  if (result) {
    res.type(result.mimetype);
    res.sendFile(path.join(__dirname, '../documents', result.filename));
  } else {
    res.status(400).json({
      message: `Document ${documentId} doesn't exist or you don't have right to check it out.`
    });
  }
}
