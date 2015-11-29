import colors from 'colors';

export function printError(msg) {
  console.log(`\n  error: ${msg} \n`.red);
}

export function printInfo(msg) {
  console.log(`\n  info: ${msg} \n`.green);
}
