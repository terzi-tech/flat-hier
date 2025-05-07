import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addObject } from '../src/core/addObject.js';
import * as fs from 'fs';
import * as utils from '../src/utils/generateUniqueId.js';
import * as compute from '../src/utils/computeOutlines.js';

vi.mock('fs', async () => {
  const actualFs = await vi.importActual('fs');
  return {
    ...actualFs,
    readFileSync: vi.fn(() => JSON.stringify({
      unique_id: "PLACEHOLDER",
      title: "New Object",
      hier: "PLACEHOLDER",
      outline: "PLACEHOLDER",
      status: "PLACEHOLDER",
      description: "PLACEHOLDER"
    }))
  };
});
vi.mock('../src/utils/generateUniqueId.js');
vi.mock('../src/utils/computeOutlines.js');

describe('addObject', () => {
  beforeEach(() => {
    // Mock the template file
    fs.readFileSync.mockReturnValue(JSON.stringify({
      unique_id: "PLACEHOLDER",
      title: "New Object",
      hier: "PLACEHOLDER",
      outline: "PLACEHOLDER",
      status: "PLACEHOLDER",
      description: "PLACEHOLDER"
    }));

    // Mock utility functions
    utils.generateUniqueId.mockReturnValue('mock-unique-id');
    compute.computeOutlines.mockImplementation(data => data);
  });

  it('should insert a new object after the specified outline number', () => {
    const data = [
      { outline: '1', hier: 'root' },
      { outline: '1.1', hier: 'child' }
    ];
    const result = addObject(data, '1');

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(3);
    expect(result.data[1].outline).toBe('pending');
    expect(result.data[1].unique_id).toBe('mock-unique-id');
  });

  it('should return an error when the outline number is not found', () => {
    const data = [{ outline: '1', hier: 'root' }];
    const result = addObject(data, '2');

    expect(result).toBeUndefined();
  });

  it('should call computeOutlines after insertion', () => {
    const data = [{ outline: '1', hier: 'root' }];
    addObject(data, '1');

    expect(compute.computeOutlines).toHaveBeenCalled();
  });
});