import colors from 'colors';

export function printError(msg) {
  console.log(`${msg}`.red);
}

export function printInfo(msg) {
  console.log(`${msg}`.green);
}
