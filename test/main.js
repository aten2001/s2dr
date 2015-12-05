import isAllowed from '../server/is-allowed';
import colors from 'colors';
import moment from 'moment';

function assert(message, val1, val2) {
  if (val1 === val2) {
    console.log(`OK: ${message}`.green);
  } else {
    console.log(`FAIL: ${message}`.red);
  }
}

//isAllowed(documents, delegations, username, filename, permission)

assert('No documents and delegations.', false, isAllowed(
  [], [], 'user1', 'file1', 'checking-in'
));

assert('Our document is not there.', false, isAllowed(
  [{id: 'file2', ownerId: 'user1'}], [], 'user1', 'file1', 'checking-in'
));

assert('Owner of the document checking-in.', true, isAllowed(
  [{id: 'file1', ownerId: 'user1'}], [], 'user1', 'file1', 'checking-in'
));

assert('Owner of the document checking-out.', true, isAllowed(
  [{id: 'file1', ownerId: 'user1'}], [], 'user1', 'file1', 'checking-out'
));

assert('Owner of the document checking-in and out.', true, isAllowed(
  [{id: 'file1', ownerId: 'user1'}], [], 'user1', 'file1', 'both'
));

assert('The file is there but our user is not the owner.', false, isAllowed(
  [{id: 'file1', ownerId: 'user2'}], [], 'user1', 'file1', 'checking-in'
));

assert('Delegation of checking-in and trying checking-in.', true, isAllowed(
  [{id: 'file1', ownerId: 'user2'}],
  [{documentId: 'file1', userId: 'user1', permission: 'checking-in', time: moment().add(30, 's')}],
  'user1', 'file1', 'checking-in'
));

assert('Delegation of checking-out and trying checking-out.', true, isAllowed(
  [{id: 'file1', ownerId: 'user2'}],
  [{documentId: 'file1', userId: 'user1', permission: 'checking-out', time: moment().add(30, 's')}],
  'user1', 'file1', 'checking-out'
));

assert('Delegation of checking-in and trying checking-out.', false, isAllowed(
  [{id: 'file1', ownerId: 'user2'}],
  [{documentId: 'file1', userId: 'user1', permission: 'checking-in', time: moment().add(30, 's')}],
  'user3', 'file1', 'checking-out'
));

assert('Delegation of checking-out and trying checking-in.', false, isAllowed(
  [{id: 'file1', ownerId: 'user2'}],
  [{documentId: 'file1', userId: 'user1', permission: 'checking-out', time: moment().add(30, 's')}],
  'user1', 'file1', 'checking-in'
));

assert('Delegation of checking-in and out and trying checking-in.', true, isAllowed(
  [{id: 'file1', ownerId: 'user2'}],
  [{documentId: 'file1', userId: 'user1', permission: 'both', time: moment().add(30, 's')}],
  'user1', 'file1', 'checking-in'
));

assert('Delegation of checking-in and out and trying checking-out.', true, isAllowed(
  [{id: 'file1', ownerId: 'user2'}],
  [{documentId: 'file1', userId: 'user1', permission: 'both', time: moment().add(30, 's')}],
  'user1', 'file1', 'checking-out'
));

assert('Expired delegation of checking-in.', false, isAllowed(
  [{id: 'file1', ownerId: 'user2'}],
  [{documentId: 'file1', userId: 'user1', permission: 'checking-in', time: moment().subtract(30, 's')}],
  'user1', 'file1', 'checking-in'
));

assert('Expired delegation of checking-out.', false, isAllowed(
  [{id: 'file1', ownerId: 'user2'}],
  [{documentId: 'file1', userId: 'user1', permission: 'checking-out', time: moment().subtract(30, 's')}],
  'user1', 'file1', 'checking-out'
));

assert('Expired delegation of checking-out and in.', false, isAllowed(
  [{id: 'file1', ownerId: 'user2'}],
  [{documentId: 'file1', userId: 'user1', permission: 'both', time: moment().subtract(30, 's')}],
  'user1', 'file1', 'both'
));

assert('Expired delegation but the requester is owner.', true, isAllowed(
  [{id: 'file1', ownerId: 'user1'}],
  [{documentId: 'file1', userId: 'user1', permission: 'both', time: moment().subtract(30, 's')}],
  'user1', 'file1', 'both'
));
