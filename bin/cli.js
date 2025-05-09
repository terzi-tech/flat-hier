#!/usr/bin/env node

import helpCommand from '../src/cli/commands/help.js';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    helpCommand();
} else {
    console.log('Unknown command. Use --help or -h for usage information.');
}