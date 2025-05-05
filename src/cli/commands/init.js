import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const initCommand = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.resolve(__dirname, '../../../templates/initTemplate.json');
    const outputPath = path.resolve(process.cwd(), 'flat-json-tree.json');

    if (fs.existsSync(outputPath)) {
        console.error('Error: flat-json-tree.json already exists.');
        // Exit without Clearing
        process.exit(1);
    }

    const template = fs.readFileSync(templatePath, 'utf-8');
    fs.writeFileSync(outputPath, template, 'utf-8');
    console.log('flat-json-tree.json has been initialized.');
    // Exiting with Clearing
    process.exit(0);
};

export default initCommand;