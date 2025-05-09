#!/usr/bin/env node


import commandRegistry from '../src/cli/commandRegistry.js';

console.log('Welcome to Flat Hierarchy CLI!');

const [,, command, ...args] = process.argv;

if (!command) {
    // If no command is provided, run the helpCommand
    commandRegistry.help();
} else if (commandRegistry[command]) {
    commandRegistry[command](...args);
} else {
    console.error(`Unknown command: ${command}`);
    console.log('run fhr --help for help');
    cleanUp(state);
}