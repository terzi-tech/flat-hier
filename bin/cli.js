#!/usr/bin/env node

console.log('This is a CLI tool for managing your tasks.');

import helpCommand  from '../src/cli/commands/help.js';
import initCommand from '../src/cli/commands/init.js';

const commandMap = {
    help: helpCommand,
    init: initCommand
};

const args = process.argv.slice(2);
const command = args[0];

if (commandMap[command]) {
    commandMap[command]();
} else {
    console.log('Unknown command. Use --help or -h for usage information.');
}