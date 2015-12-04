import program from 'commander';
import readline from 'readline';
import colors from 'colors';
import exec from 'sync-exec';
import fs from 'fs';
import path from 'path';

import initWorkspace from './commands/init-workspace';
import initSession from './commands/init-session';
import checkOut from './commands/check-out';
import checkIn from './commands/check-in';
import delegate from './commands/delegate';
import safeDelete from './commands/safe-delete';
import terminateSession from './commands/terminate-session';

// client app state
let activeWorkspace = null;
let hostname = null;
let stdLine = null;
let rl = null;
let modifiedFiles = [];

// watching over files and keep a list of modifications
function updateWatchList(filename) {
  modifiedFiles = modifiedFiles.filter(file => file !== filename);
  fs.watch(path.join(__dirname, `../workspaces/${activeWorkspace}`, filename), (event, _filename) => {
    if (event === 'rename') {
      modifiedFiles = modifiedFiles.filter(file => file !== filename);
      return;
    }
    if (event === 'change' && !modifiedFiles.some(f => f === _filename)) {
      modifiedFiles = modifiedFiles.concat(_filename);
    }
  });
}

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
    checkOut(activeWorkspace, hostname, filename, newname, updateWatchList).then(() => rl.prompt());
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
    checkIn(activeWorkspace, hostname, filename, securityFlag, updateWatchList).then(() => rl.prompt());
  });

program
  .command('delegate [filename] [client] [time] [permission] [propagation flag]')
  .alias('d')
  .description('delegates permissions to other client')
  .action((filename, client, time, permission, propagationFlag) => {
    const args = {filename: filename, client: client, time: time, permission: permission, propagationFlag: propagationFlag};
    for (let arg in args) {
      if (!args[arg]) {
        missingArg(arg);
        rl.prompt();
        return;
      }
    }
    delegate(activeWorkspace, hostname, filename, client, time, permission, propagationFlag).then(() => rl.prompt());
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
    safeDelete(activeWorkspace, hostname, filename).then(() => rl.prompt());
  });

program
  .command('terminate-session')
  .alias('ts')
  .description('terminates the secure session')
  .action(() => {
    terminateSession(activeWorkspace, hostname, modifiedFiles);
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
  .alias('h')
  .action(() => {
    console.log('');
    console.log('Commands:');
    console.log('');
    console.log('  Command: \t\tAlias:\t\tArguments:\t\tDescription:'.green);
    console.log('  init-session\t\tis\t\t<hostname>\t\tstarts a new secure session, keys must be initialized');
    console.log('  check-out\t\tco\t\t<filename>\t\tchecks out the file from the server');
    console.log('           \t\t\t\t[newname]\t\tsaves it as [newname], optional, default is <filename>');
    console.log('  check-in\t\tci\t\t<filename>\t\tsends the file to the server');
    console.log('          \t\t\t\t<security flag>\t\tCONFIDENTIALITY | INTEGRITY | NONE');
    console.log('  delegate\t\td\t\t<filename>\t\tdelegates permissions to other client');
    console.log('          \t\t\t\t<client>\t\tusername | ALL');
    console.log('          \t\t\t\t<time>\t\t\ttime(s)');
    console.log('          \t\t\t\t<permission>\t\tchecking-in | checking-out | both');
    console.log('          \t\t\t\t<propagation flag>\ttrue | false');
    console.log('  safe-delete\t\tsd\t\t<filename>\t\tdeletes the file from the server');
    console.log('  terminate-session\tts\t\t\t\t\tterminates the secure session');
    console.log('  help\t\t\th\t\t\t\t\tdisplays this help');
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
    terminateSession(activeWorkspace, hostname, modifiedFiles);
  });

});


function missingArg(argName) {
  console.log(`Missing required argument `.red + `${argName}`.underline.red);
}

colors.red;
