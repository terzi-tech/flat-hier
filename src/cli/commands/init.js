import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { generateUniqueId } from '../../index.js';

const initCommand = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.resolve(__dirname, '../../../templates/initTemplate.json');


    // Parse command-line arguments
    const args = process.argv.slice(2).map(arg => (arg === '-n' ? '--name' : arg)); // Normalize -n to --name
    const nameIndex = args.indexOf('--name');
    let outputFileName = nameIndex !== -1 && args[nameIndex + 1] ? args[nameIndex + 1].replace(/\s+/g, '_') : null;

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

    const createConfigFile = (fileName) => {
        const baseName = path.basename(fileName, path.extname(fileName)); // Extract base name without extension
        const configFileName = `${baseName}.fhr.config.json`;
        const configFilePath = path.join(process.cwd(), configFileName);

        if (fs.existsSync(configFilePath)) {
            console.warn(`Warning: ${configFileName} already exists. Skipping creation.`);
            return;
        }

        const defaultConfig = {
            filepath: `./${fileName}`,
            createdAt: new Date().toISOString(),
        };

        fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig, null, 4), 'utf-8');
        console.log(`${configFileName} has been created.`);
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

        // Create a new <name>.config.json file
        createConfigFile(finalFileName);

        process.exit(0);
    };

    if (outputFileName) {
        proceedWithFileName(outputFileName);
    } else {
        promptForFileName(proceedWithFileName);
    }
};

export default initCommand;