import fs from 'fs';
import https from 'https';
import path from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import express from 'express';
import multer from 'multer';

import checkIn from './routes/check-in';
import checkOut from './routes/check-out';
import delegate from './routes/delegate';
import initSession from './routes/init-session';
import safeDelete from './routes/safe-delete';

import storage from 'node-persist';
storage.initSync({dir: path.join(__dirname, 'persist')});

!storage.getItemSync('users') && storage.setItemSync('users', []);
!storage.getItemSync('documents') && storage.setItemSync('documents', []);
!storage.getItemSync('delegations') && storage.setItemSync('delegations', []);

const app = express();
const router = express.Router();

//app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const upload = multer({dest:'./server/documents/'}).single('document');
app.use(upload);

// to see what is going on (all incoming requests)
router.use((req, res, next) => {
  console.log(new Date() + `${req.connection.remoteAddress} ${req.socket.getPeerCertificate().subject.CN} ${req.method} ${req.url}`);
  next();
});

router.route('/init')
  .get(initSession);

router.route('/document')
  .get(checkOut)
  .post(checkIn)
  .delete(safeDelete)
  .put(delegate);

router.route('*')
  .all((req, res) => {
    res.status(404).json({message: `Route not found.`});
  });

app.use('/', router);

const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/server-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/server-crt.pem')),
  ca: fs.readFileSync(path.join(__dirname, '../ca/ca-crt.pem')),
  requestCert: true,
  rejectUnauthorized: true
};

https.createServer(options, app).listen(4433);
console.log('Server is running at https://localhost:4433 ...');
