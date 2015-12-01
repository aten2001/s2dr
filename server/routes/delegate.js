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
  if (!users.some(user => user.id === req.body.client)) {
    res.status(400).json({message: `User ${req.body.client} doesn't exist.`});
    return;
  }

  let delegation = null;
  // check if this request comes from the file owner
  if (docs.some(doc => doc.id === filename && doc.ownerId === username)) {
    delegation = {time: 'inf', permission: 'both', propagationFlag: 'true'};
  }
  // find delegation for me
  if (!delegation) {
    delegation = delegations.find(d => d.documentId === filename && d.userId === username && d.propagationFlag);
  }
  // if there is none, try to find general one
  if (!delegation) {
    delegation = delegations.find(d => d.documentId === filename && d.userId === 'ALL' && d.propagationFlag);
  }

  // still no delegation for me? that's the end
  if (!delegation) {
    res.status(400).json({message: `You don't have permissions to delegate ${filename}.`});
    return;
  }

  // check the propagationFlag
  if (delegation.propagationFlag === 'false') {
    res.status(400).json({message: `You can't delegate to the file ${filename} because propagationFlag is false`});
    return;
  }

  // check if requested permissions can be delegated
  if (delegation.permission !== 'both' && permission !== delegation.permission) {
    res.status(400).json({message: `You can't delegate the permission ${permission} to the file ${filename}.`});
    return;
  }

  // yay, all checks passed, let's fcreate a new delegation
  let setTime = moment().add(parseInt(req.body.time, 10), 's').format();
  if (delegation.time !== 'inf' && moment(setTime) > moment(delegation.time)) {
    setTime = delegation.time;
  }
  storage.setItemSync('delegations', delegations
    .filter(d => d.documentId !== filename && d.userId !== req.body.client)
    .concat({
      documentId: filename,
      userId: req.body.client,
      permission: permission,
      time: setTime,
      propagationFlag: req.body.propagationFlag === 'false' ? false : true
    })
  );
  res.json({
    message: `Document ${filename} was delegated to user ${req.body.client} with permission ${permission}
              until ${setTime} and propagationFlag set to ${req.body.propagationFlag}!`
  });
}
