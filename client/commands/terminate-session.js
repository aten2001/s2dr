import Bluebird from 'bluebird';
import checkIn from './check-in';

export default function terminateSession(activeWorkspace, hostname, modifiedFiles) {
  if (!hostname) {
    close();
  }

  Bluebird.all(modifiedFiles.map(file => checkIn(activeWorkspace, hostname, file, 'UPDATE', () => {})))
    .then(() => close());
}

function close() {
  console.log('Have a great day!'.green);
  process.exit(0);
}
