import { addObject } from '../src/core/addObject.js';
import { describe, it, expect } from 'vitest';
import { computeOutlines } from '../src/utils/computeOutlines.js';

// Mock computeOutlines to ensure it updates outline numbers correctly
jest.mock('../src/utils/computeOutlines.js', () => ({
  computeOutlines: jest.fn((data) => {
    let counter = 1;
    data.forEach((item) => {
      if (item.outline === 'pending') {
        item.outline = `1.${counter++}`;
      }
    });
    return data;
  }),
}));

describe('addObject', () => {
  it('should add a new object after the item with the specified outline number', () => {
    const data = [
      { outline: '1', hier: '1', unique_id: 'id-1' },
      { outline: '1.1', hier: '1.1', unique_id: 'id-2' },
    ];

    const outlineNumber = '1';

    const result = addObject(data, outlineNumber);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(3);
    expect(result.data[1].outline).toBe('pending');
    expect(result.data[1].hier).toBe('1');
    expect(result.data[1].unique_id).toBeDefined();
    expect(result.selectedIndex).toBe(1);
  });

  it('should return undefined if the outline number is not found', () => {
    const data = [
      { outline: '1', hier: '1', unique_id: 'id-1' },
      { outline: '1.1', hier: '1.1', unique_id: 'id-2' },
    ];

    const outlineNumber = '2';

    const result = addObject(data, outlineNumber);

    expect(result).toBeUndefined();
  });
});