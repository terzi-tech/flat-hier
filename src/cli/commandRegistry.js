import initCommand from './commands/init.js';
import { boot } from '../../bin/cli.js';

const commandRegistry = {
    init: initCommand,
    editor: boot,
};

export default commandRegistry;