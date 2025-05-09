import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { state } from '../../../bin/cli.js';
import { generateUniqueId } from '../../index.js';
import { cleanUp } from '../../utils/cleanUp.js'; // Import the cleanup function

const initCommand = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.resolve(__dirname, '../../../templates/initTemplate.json');
    const configPath = path.resolve(__dirname, '../../../flat-hier.config.json'); // Updated to dynamically resolve the config file path

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

        rl.question('File Path (default: flat-hier.json): ', (answer) => {
            rl.close();
            // Replace spaces with underscores in the file name
            const sanitizedAnswer = answer.replace(/\s+/g, '_');
            // Ensure the terminal cursor is reset properly
            process.stdout.write('\n');
            callback(sanitizedAnswer || 'flat-hier.json');
        });
    };

    // Fix the `updateConfigFile` function to ensure it writes relative paths correctly
    const updateConfigFile = (fileName) => {
        const relativeFilePath = path.relative(process.cwd(), path.resolve(process.cwd(), fileName)); // Calculate relative path

        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            config.filepath = `./${relativeFilePath}`; // Save as relative path
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');
            console.log(`Updated config file with relative path: ./${relativeFilePath}`);
        } else {
            console.warn('Warning: Config file not found. Skipping config update.');
        }
    };

    const proceedWithFileName = (fileName) => {
        // Ensure the file name ends with .json
        const finalFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
        const outputPath = path.join(process.cwd(), finalFileName); // Use relative path

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

        // Rename the title of the first item to the file name
        if (parsedTemplate.length > 0) {
            parsedTemplate[0].title = fileName;
        }

        fs.writeFileSync(outputPath, JSON.stringify(parsedTemplate, null, 4), 'utf-8');
        console.log(`${finalFileName} has been initialized with updated unique IDs.`);

        // Update the config file with a relative path
        updateConfigFile(finalFileName);

        // Set state.mode to 'edit'
        state.mode = 'edit';

        cleanUp(state); // Ensure cleanup is called at the end of the init command

        process.exit(0);
    };

    if (outputFileName) {
        proceedWithFileName(outputFileName);
    } else {
        promptForFileName(proceedWithFileName);
    }
};

export default initCommand;