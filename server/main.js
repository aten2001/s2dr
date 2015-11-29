import fs from 'fs';
import https from 'https';
import path from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import express from 'express';

const app = express();
const router = express.Router();

app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

router.route('/init')
  .get((req, res) => {
    console.log(new Date() + ' ' +
    req.connection.remoteAddress + ' ' +
    req.socket.getPeerCertificate().subject.CN + ' ' +
    req.method + ' ' + req.url);
    res.json({message: `Welcome ${req.socket.getPeerCertificate().subject.CN}!`});
  });

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
