import initCommand from './commands/init.js';

const commandRegistry = {
    init: initCommand,
    edit: () => {
        // The `edit` command registration is now handled in `cli.js`.
    }
};

export default commandRegistry;