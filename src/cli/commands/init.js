import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

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

        rl.question('Please enter a name for the file (default: flat-json-tree.json): ', (answer) => {
            rl.close();
            // Ensure the terminal cursor is reset properly
            process.stdout.write('\n');
            callback(answer || 'flat-json-tree.json');
        });
    };

    const updateConfigFile = (fileName) => {
        const configPath = path.resolve(process.cwd(), 'flat-json-tree.config.json');

        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            config.filepath = `./${fileName}`;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');
            console.log(`Updated config file: ${configPath}`);
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
        fs.writeFileSync(outputPath, template, 'utf-8');
        console.log(`${finalFileName} has been initialized.`);

        // Update the config file
        updateConfigFile(finalFileName);

        process.exit(0);
    };

    if (outputFileName) {
        proceedWithFileName(outputFileName);
    } else {
        promptForFileName(proceedWithFileName);
    }
};

export default initCommand;