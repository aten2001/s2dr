import program from 'commander';
import readline from 'readline';
import colors from 'colors';

import initWorkspace from './commands/init-workspace';
import initSession from './commands/init-session';
import checkOut from './commands/check-out';
import checkIn from './commands/check-in';
import delegate from './commands/delegate';
import safeDelete from './commands/safe-delete';
import terminateSession from './commands/terminate-session';

let activeWorkspace = null;
let hostname = null;

program
  .command('init-workspace [username]')
  .alias('iw')
  .description('creates a new workspace and generates keys')
  .action((username) => {
    if (!username) {
      missingArg('username');
      return;
    }
    initWorkspace(username);
    activeWorkspace = username;
  });

program
  .command('init-session [hostname]')
  .alias('is')
  .description('starts a new secure session, keys must be initialized')
  .action((_hostname) => {
    hostname = _hostname;
    if (!_hostname) {
      //missingArg('hostname');
      //return;
      hostname = 'https://localhost:4433'; // to make testing faster for developing
    }
    initSession(activeWorkspace, hostname);
  });

program
  .command('check-out [filename] [newname]')
  .alias('co')
  .description('check out the file from the server')
  .action((filename, newname) => {
    if (!filename) {
      missingArg('filename');
      return;
    }
    if (!newname) {
      newname = filename;
    }
    checkOut(activeWorkspace, hostname, filename, newname);
  });

program
  .command('check-in [filename] [security flag]')
  .alias('ci')
  .description('sends the file to the server')
  .action((filename, securityFlag) => {
    if (!filename) {
      missingArg('filename');
      return;
    }
    if (!securityFlag) {
      missingArg('securityFlag');
      return;
    }
    checkIn(activeWorkspace, hostname, filename, securityFlag);
  });

program
  .command('delegate [filename] [client] [time] [propagation flag]')
  .alias('d')
  .description('delegates permissions to other client')
  .action((filename, client, time, propagationFlag) => {
    const args = {filename: filename, client: client, time: time, propagationFlag: propagationFlag};
    for (let arg in args) {
      if (!args[arg]) {
        missingArg(arg);
        return;
      }
    }
    delegate(filename, client, time, propagationFlag);
  });

program
  .command('safe-delete [filename]')
  .alias('sd')
  .description('deletes the file from the server')
  .action((filename) => {
    if (!filename) {
      missingArg('filename');
      return;
    }
    safeDelete(filename);
  });

program
  .command('terminate-session')
  .alias('ts')
  .description('terminates the secure session')
  .action(() => {
    terminateSession();
  });

program
  .command('*')
  .action((env) => env && console.log(`\n  error: Unknown command. Try 'help' for all available commands.\n`.red));

program
  .command('help')
  .action(() => {
    console.log('');
    console.log('Commands:');
    console.log('');
    console.log('  Name: \t\tArguments:\t\tDescription:'.green);
    console.log('  init-workspace\t\<username>\t\tcreates a new workspace and generates keys');
    console.log('  init-session\t\t<hostname>\t\tstarts a new secure session, keys must be initialized');
    console.log('  check-out\t\t<filename>\t\tchecks out the file from the server');
    console.log('           \t\t[newname]\t\tsaves it as [newname], optional, default is <filename>');
    console.log('  check-in\t\t<filename>\t\tsends the file to the server');
    console.log('          \t\t<security flag>');
    console.log('  delegate\t\t<filename>\t\tdelegates permissions to other client');
    console.log('          \t\t<client>');
    console.log('          \t\t<time>');
    console.log('          \t\t<propagation flag>');
    console.log('  safe-delete\t\t<filename>\t\tdeletes the file from the server');
    console.log('  terminate-session\t\t\t\tterminates the secure session');
    console.log('  help\t\t\t\t\t\tdisplays this help');
    console.log('');
  });

// main program loop, reading and parsing stdin input
const rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('s2dr> ');
rl.prompt();
rl.on('line', (line) => {
  program.parse([null, null].concat(line.trim().split(' ')));
  rl.prompt();
}).on('close', () => {
  terminateSession();
});

function missingArg(argName) {
  console.log(`\n  error: missing required argument `.red + `${argName}\n`.underline.red);
}

colors.red;
