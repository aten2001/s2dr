import moment from 'moment';

export default function isAllowed(documents, delegations, username, filename, permission) {
  // check if this request comes from the file owner
  if (documents.some(doc => doc.id === filename && doc.ownerId === username)) {
    return true;
  }

  // not owner? maybe there is a matching delegation
  return delegations.some(d => d.documentId === filename &&
                               (d.userId === username || d.userId === 'ALL') &&
                               (d.permission === 'both' || d.permission === permission) &&
                               (moment(d.time) > moment()));
}
