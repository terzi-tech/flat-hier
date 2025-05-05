import fs from 'fs/promises';

class DataService {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = null;
    }

    async loadData() {
        try {
            const fileContent = await fs.readFile(this.filePath, 'utf-8');
            this.data = JSON.parse(fileContent);
        } catch (error) {
            console.error(`Failed to load data from ${this.filePath}:`, error);
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