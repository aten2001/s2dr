import program from 'commander';
import readline from 'readline';
import colors from 'colors';
import exec from 'sync-exec';

import initWorkspace from './commands/init-workspace';
import initSession from './commands/init-session';
import checkOut from './commands/check-out';
import checkIn from './commands/check-in';
import delegate from './commands/delegate';
import safeDelete from './commands/safe-delete';
import terminateSession from './commands/terminate-session';

let activeWorkspace = null;
let hostname = null;
let stdLine = null;
let rl = null;

program
  .command('init-session [hostname]')
  .alias('is')
  .description('starts a new secure session, keys must be initialized')
  .action((_hostname) => {
    hostname = _hostname;
    if (!_hostname) {
      //missingArg('hostname');
      //rl.prompt();
      //return;
      hostname = 'https://localhost:4433'; // to make testing faster for developing
    }
    initSession(activeWorkspace, hostname).then(() => rl.prompt());
  });

program
  .command('check-out [filename] [newname]')
  .alias('co')
  .description('check out the file from the server')
  .action((filename, newname) => {
    if (!filename) {
      missingArg('filename');
      rl.prompt();
      return;
    }
    if (!newname) {
      newname = filename;
    }
    checkOut(activeWorkspace, hostname, filename, newname).then(() => rl.prompt());
  });

program
  .command('check-in [filename] [security flag]')
  .alias('ci')
  .description('sends the file to the server')
  .action((filename, securityFlag) => {
    if (!filename) {
      missingArg('filename');
      rl.prompt();
      return;
    }
    if (!securityFlag) {
      missingArg('securityFlag');
      rl.prompt();
      return;
    }
    checkIn(activeWorkspace, hostname, filename, securityFlag).then(() => rl.prompt());
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
        rl.prompt();
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
      rl.prompt();
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
  .action((env) => {
    if (!activeWorkspace) {
      env && console.log(`Unknown command ${env}. Try 'help' for all available commands.`.red);
    } else {
      let res = exec(stdLine, {cwd: `workspaces/${activeWorkspace}`});
      res.stdout && console.log(res.stdout);
      res.stderr && console.log(res.stderr.red);
    }
    rl.prompt();
  });

program
  .command('help')
  .action(() => {
    console.log('');
    console.log('Commands:');
    console.log('');
    console.log('  Name: \t\tArguments:\t\tDescription:'.green);
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
    rl.prompt();
  });

// main program loop, reading and parsing stdin input
rl = readline.createInterface(process.stdin, process.stdout);
rl.question('What is your username (workspace)? '.green, (answer) => {
  if (!answer) {
    console.log(`error: You can't leave username empty.`.red);
    return;
  }
  initWorkspace(answer);
  activeWorkspace = answer;

  rl.setPrompt(`s2dr:${activeWorkspace}> `);
  rl.prompt();
  rl.on('line', (line) => {
    stdLine = line;
    program.parse([null, null].concat(line.trim().split(' ')));
  }).on('close', () => {
    terminateSession();
  });

});


function missingArg(argName) {
  console.log(`Missing required argument `.red + `${argName}`.underline.red);
}

colors.red;
