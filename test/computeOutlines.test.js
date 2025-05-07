import { describe, it, beforeAll, expect } from 'vitest';

const mockData = [
  { hier: 0, title: 'Root' },
  { hier: 1, title: 'Child 1' },
  { hier: 1, title: 'Child 2' },
  { hier: 2, title: 'Grandchild 1' },
];

const expectedOutlines = [
  { hier: 0, title: 'Root', outline: '1' },
  { hier: 1, title: 'Child 1', outline: '1.1' },
  { hier: 1, title: 'Child 2', outline: '1.2' },
  { hier: 2, title: 'Grandchild 1', outline: '1.2.1' },
];

describe('computeOutlines', () => {
  it('should compute outlines correctly for mock data', () => {
    const computeOutlines = (items) => {
      const counters = [];
      items.forEach((item) => {
        const level = item.hier;
        counters[level] = (counters[level] || 0) + 1;
        counters.length = level + 1;
        item.outline = counters.join('.');
      });
      return items;
    };

    const result = computeOutlines(mockData);
    expect(result).toEqual(expectedOutlines);
  });
});