#!/usr/bin/env node

import helpCommand from '../src/cli/commands/help.js';
import initCommand from '../src/cli/commands/init.js';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    helpCommand();
} else if (args[0] === 'init') {
    initCommand();
} else {
    console.log('Unknown command. Use --help or -h for usage information.');
}