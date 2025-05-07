import test from 'ava';
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

test.beforeEach(async () => {
    // Write mock data to the correct test file path before each test
    await fs.writeFile(testFilePath, JSON.stringify(mockData, null, 2), 'utf-8');
});

test.afterEach(async () => {
    // Remove the test file after each test
    // fs.unlink(testFilePath).catch(() => {});
});

test('loadData should load data from a valid file', async t => {
    const dataService = new DataService('test/test-data.json');
    await dataService.loadData();
    t.deepEqual(dataService.getData(), mockData);
});

test('loadData should throw an error if the file does not exist', async t => {
    const invalidFilePath = path.resolve('non-existent.json');
    const dataService = new DataService(invalidFilePath);
    const error = await t.throwsAsync(() => dataService.loadData());
    t.is(error.message, `File ${invalidFilePath} does not exist. Check flat-hier.config.json or run init command.`);
});

test('saveData should save data to a file', async t => {
    const dataService = new DataService('test/test-data.json');
    dataService.setData(mockData);
    await dataService.saveData();

    const savedContent = JSON.parse(await fs.readFile(testFilePath, 'utf-8'));
    t.deepEqual(savedContent, mockData);
});

test('getData should return the current in-memory data', t => {
    const dataService = new DataService('test/test-data.json');
    dataService.setData(mockData);
    t.deepEqual(dataService.getData(), mockData);
});

test('setData should update the in-memory data', t => {
    const dataService = new DataService('test/test-data.json');
    const newData = [{ "unique_id": "NEW_ID", "title": "Updated Object" }];
    dataService.setData(newData);
    t.deepEqual(dataService.getData(), newData);
});