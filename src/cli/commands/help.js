import fs from 'fs';
import path from 'path';
import { exitWithoutClear } from '../../utils/exitWithoutClear.js';
import { fileURLToPath } from 'url';

const helpCommand = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const helpFilePath = path.resolve(__dirname, 'help.txt');
    const helpText = fs.readFileSync(helpFilePath, 'utf-8');
    console.log(helpText);
    exitWithoutClear();
};

export default helpCommand;