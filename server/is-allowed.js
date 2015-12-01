import storage from 'node-persist';
import moment from 'moment';

export default function isAllowed(username, filename, permission) {
  // check if this request comes from the file owner
  if (storage.getItemSync('documents')
       .some(doc => doc.id === filename && doc.ownerId === username)) {
    return true;
  }

  // not owner? maybe there is a matching delegation
  return storage.getItemSync('delegations')
          .some(d => d.documentId === filename &&
                     (d.userId === username || d.userId === 'ALL') &&
                     (d.permission === 'both' || d.permission === permission) &&
                     (moment(d.time) > moment()));
}
