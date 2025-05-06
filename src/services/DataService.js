import fs from 'fs/promises';
import path from 'path';

class DataService {
    constructor(filePath) {
        this.filePath = path.resolve(process.cwd(), filePath);
        this.data = null;
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
                const fileName = path.basename(this.filePath);
                console.error(`"${fileName}" does not exist. Check flat-json-tree.config.json or run init command.`);
            } else {
                console.error(`Failed to load data from ${this.filePath}.`);
            }
            // Suppress the re-thrown error to only display the custom message
            process.exit(1);
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