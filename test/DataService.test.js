import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import DataService from '../src/services/DataService.js';

const testFilePath = path.resolve('test/test-data.json');
const mockData = [
    {
        "unique_id": "PLACEHOLDER",
        "title": "New Project",
        "hier": "0",
        "outline": "0",
        "description": "PLACEHOLDER"
    },
    {
        "unique_id": "PLACEHOLDER",
        "title": "New Object",
        "hier": "0",
        "outline": "1",
        "description": "PLACEHOLDER"
    }
];

describe('DataService', () => {
    beforeEach(async () => {
        // Write mock data to the correct test file path before each test
        await fs.writeFile(testFilePath, JSON.stringify(mockData, null, 2), 'utf-8');
    });

    afterEach(async () => {
        // Remove the test file after each test
        fs.unlink(testFilePath).catch(() => {});
    });

    it('loadData should load data from a valid file', async () => {
        const dataService = new DataService('test/test-data.json');
        await dataService.loadData();
        expect(dataService.getData()).toEqual(mockData);
    });

    it('loadData should throw an error if the file does not exist', async () => {
        const invalidFilePath = path.resolve('non-existent.json');
        const dataService = new DataService(invalidFilePath);
        await expect(dataService.loadData()).rejects.toThrow(
            `File ${invalidFilePath} does not exist. Check flat-hier.config.json or run init command.`
        );
    });

    it('saveData should save data to a file', async () => {
        const dataService = new DataService('test/test-data.json');
        dataService.setData(mockData);
        await dataService.saveData();

        const savedContent = JSON.parse(await fs.readFile(testFilePath, 'utf-8'));
        expect(savedContent).toEqual(mockData);
    });

    it('getData should return the current in-memory data', () => {
        const dataService = new DataService('test/test-data.json');
        dataService.setData(mockData);
        expect(dataService.getData()).toEqual(mockData);
    });

    it('setData should update the in-memory data', () => {
        const dataService = new DataService('test/test-data.json');
        const newData = [{ "unique_id": "NEW_ID", "title": "Updated Object" }];
        dataService.setData(newData);
        expect(dataService.getData()).toEqual(newData);
    });
});