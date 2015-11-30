import colors from 'colors';

export function printError(msg) {
  if (msg.indexOf('message') > -1) {
    msg = JSON.parse(msg.split(' - ')[1]).message;
  }
  console.log(`${msg}`.red);
}

export function printInfo(msg) {
  console.log(`${msg}`.green);
}
