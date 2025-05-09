import fs from 'fs/promises';
import fsSync from 'fs'; // Import the synchronous fs module for readdirSync
import path from 'path';

class DataService {
    constructor() {
        const mainDir = process.cwd();

        try {
            const configFileName = fsSync.readdirSync(mainDir).find(file => file.endsWith('.fhr.config.json'));
            if (!configFileName) {
                console.error('Error: No .fhr.config.json file found in the main directory. \n run `fhr init` command to create one.');
                process.exit(1);
            }

            const configFilePath = path.resolve(mainDir, configFileName);
            const configContent = JSON.parse(fsSync.readFileSync(configFilePath, 'utf-8'));

            if (!configContent.filepath) {
                console.error('Error: The .fhr.config.json file is missing the "filepath" property. Please check the configuration file.');
                process.exit(1);
            }

            this.filePath = path.resolve(mainDir, configContent.filepath);
            this.data = null;
        } catch (error) {
            console.error('An unexpected error occurred while initializing the DataService:', error.message);
            process.exit(1);
        }
    }

    async loadData() {
        try {
            // Check if the file exists
            await fs.access(this.filePath);

            // Read and parse the file content
            const fileContent = await fs.readFile(this.filePath, 'utf-8');
            this.data = JSON.parse(fileContent);
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`File ${this.filePath} does not exist. Check flat-hier.config.json or run init command.`);
            } else {
                console.error(`Failed to load data from ${this.filePath}.`);
            }
            // Suppress the re-thrown error to only display the custom message
            throw error;
        }
    }

    async saveData() {
        try {
            const fileContent = JSON.stringify(this.data, null, 2);
            await fs.writeFile(this.filePath, fileContent, 'utf-8');
        } catch (error) {
            console.error(`Failed to save data to ${this.filePath}:`, error);
            throw error;
        }
    }

    getData() {
        return this.data;
    }

    setData(newData) {
        this.data = newData;
    }
}

export default DataService;