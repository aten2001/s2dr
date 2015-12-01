import storage from 'node-persist';
import sanitize from 'sanitize-filename';
import moment from 'moment';

export default function delegate(req, res) {
  const filename = sanitize(req.body.filename);
  const username = sanitize(req.socket.getPeerCertificate().subject.CN);

  const docs = storage.getItemSync('documents');
  const users = storage.getItemSync('users');
  const delegations = storage.getItemSync('delegations');

  const permission = req.body.permission.toLowerCase();
  if (['checking-in', 'checking-out', 'both'].indexOf(permission) === -1) {
    res.status(400).json({message: `Permission can be set to checking-in, checking-out or both. Not to ${permission}`});
    return;
  }

  // check that file exists
  if (!docs.some(doc => doc.id === filename)) {
    res.status(400).json({message: `Document ${filename} doesn't exist.`});
    return;
  }

  // check if the client exists
  if (!users.some(user => user.id === req.body.client || req.body.client === 'ALL')) {
    res.status(400).json({message: `User ${req.body.client} doesn't exist.`});
    return;
  }

  // check if this request comes from the file owner
  if (docs.some(doc => doc.id === filename && doc.ownerId === username)) {
    createDelegation(req, res, delegations, filename, permission, 'inf');
    return;
  }

  // find all matching delegations and sort them by the time
  const match = delegations.filter(d => d.documentId === filename &&
                                        (d.userId === username || d.userId === 'ALL') &&
                                        (d.permission === 'both' || d.permission === permission) &&
                                        (moment(d.time) > moment()) &&
                                        d.propagationFlag)
                           .sort((d1, d2) => {
                             if (moment(d1.time) > moment(d2.time)) return 1;
                             if (moment(d1.time) < moment(d2.time)) return -1;
                             return 0;
                           });

  if (match.length === 0) {
    res.status(400).json({message: `You can't make this delegation for the file ${filename}.`});
    return;
  }

  createDelegation(req, res, delegations, filename, permission, match[0].time);
}

function createDelegation(req, res, delegations, filename, permission, maxTime) {
  // yay, all checks passed, let's fcreate a new delegation
  let setTime = moment().add(parseInt(req.body.time, 10), 's').format();
  if (maxTime !== 'inf' && moment(setTime) > moment(maxTime)) {
    setTime = maxTime;
  }

  storage.setItemSync('delegations', delegations
    .filter(d => d.documentId !== filename || d.userId !== req.body.client || d.permission !== permission)
    .concat([{
      documentId: filename,
      userId: req.body.client,
      permission: permission,
      time: setTime,
      propagationFlag: req.body.propagationFlag === 'false' ? false : true
    }])
  );
  res.json({
    message: `Document ${filename} was delegated to user ${req.body.client} with permission ${permission} until ${setTime} and propagationFlag set to ${req.body.propagationFlag}!`
  });
}
