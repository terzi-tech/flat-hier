import initCommand from './commands/init.js';
import helpCommand from './commands/help.js';
import { boot } from '../../bin/editor.js';
import { state } from '../../bin/editor.js';
import { exitWithoutClear } from '../utils/exitWithoutClear.js';

const commandRegistry = {
    init: (...args) => {
        process.stdin.removeAllListeners('keypress'); // Completely disable keypress listener
        state.mode = 'edit'; // Set state.mode to 'edit' for the init command
        initCommand(...args);
    },
    editor: boot,
    help: helpCommand,
    '--help': helpCommand,
    '-h': helpCommand,
    '--add-after': (...args) => { 
        if (args.length < 2) {
            console.error('Error: Missing required arguments. Usage: fhr --add-after <outline number> <title>');
            exitWithoutClear();
        }
        console.log('outline number:', args[0]);
        console.log('title:', args[1]);
        exitWithoutClear();
    }
};

export default commandRegistry;