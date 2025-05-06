import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { state, cleanup } from '../../../bin/cli.js';
import { generateUniqueId } from '../../index.js';

const initCommand = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.resolve(__dirname, '../../../templates/initTemplate.json');

    // Parse command-line arguments
    const args = process.argv.slice(2);
    const nameIndex = args.indexOf('--name');
    let outputFileName = nameIndex !== -1 && args[nameIndex + 1] ? args[nameIndex + 1] : null;

    const promptForFileName = (callback) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Clear the console before prompting
        console.clear();

        rl.question('File Path (default: flat-json-tree.json): ', (answer) => {
            rl.close();
            // Replace spaces with underscores in the file name
            const sanitizedAnswer = answer.replace(/\s+/g, '_');
            // Ensure the terminal cursor is reset properly
            process.stdout.write('\n');
            callback(sanitizedAnswer || 'flat-json-tree.json');
        });
    };

    // Fix the `updateConfigFile` function to ensure it writes absolute paths correctly
    const updateConfigFile = (fileName) => {
        const configPath = path.resolve(process.cwd(), 'node_modules/flat-json-tree/flat-json-tree.config.json');
        const absoluteFilePath = path.resolve(process.cwd(), fileName);

        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            config.filepath = absoluteFilePath; // Ensure absolute path is written
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');
            console.log(`Updated config file with absolute path: ${absoluteFilePath}`);
        } else {
            console.warn('Warning: Config file not found. Skipping config update.');
        }
    };

    const proceedWithFileName = (fileName) => {
        // Ensure the file name ends with .json
        const finalFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
        const outputPath = path.resolve(process.cwd(), finalFileName);

        if (fs.existsSync(outputPath)) {
            console.error(`Error: ${finalFileName} already exists.`);
            process.exit(1);
        }

        const template = fs.readFileSync(templatePath, 'utf-8');
        const parsedTemplate = JSON.parse(template);

        // Generate unique IDs for all items in the template
        parsedTemplate.forEach(item => {
            item.unique_id = generateUniqueId();
        });

        fs.writeFileSync(outputPath, JSON.stringify(parsedTemplate, null, 4), 'utf-8');
        console.log(`${finalFileName} has been initialized with updated unique IDs.`);

        // Update the config file
        updateConfigFile(finalFileName);

        // Set state.mode to 'edit'
        state.mode = 'edit';

        cleanup(); // Ensure cleanup is called at the end of the init command

        process.exit(0);
    };

    if (outputFileName) {
        proceedWithFileName(outputFileName);
    } else {
        promptForFileName(proceedWithFileName);
    }
};

export default initCommand;