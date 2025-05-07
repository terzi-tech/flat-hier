import { describe, it, expect } from 'vitest';
import { flattenTree } from '../src/utils/flattenTree.js';

describe('flattenTree', () => {
  it('should flatten a tree structure into an array with updated hier and outline', () => {
    const tree = [
      {
        title: 'Root',
        children: [
          {
            title: 'Child 1',
            children: [
              { title: 'Grandchild 1', children: [] },
            ],
          },
          { title: 'Child 2', children: [] },
        ],
      },
    ];

    const expected = [
      { title: 'Root', hier: 0, outline: '0' },
      { title: 'Child 1', hier: 1, outline: '0.1' },
      { title: 'Grandchild 1', hier: 2, outline: '0.1.1' },
      { title: 'Child 2', hier: 1, outline: '0.2' },
    ];

    const result = flattenTree(tree);
    console.log('Heierarchy:', tree); // Add this line to print the original tree
    console.log('Flattened Tree:', result); // Add this line to print the result
    expect(result).toEqual(expected);
  });

  it('should handle an empty tree', () => {
    const tree = [];
    const expected = [];
    const result = flattenTree(tree);
    console.log('Flattened Empty Tree:', result); // Add this line to print the result
    expect(result).toEqual(expected);
  });

  it('should handle a tree with a single node', () => {
    const tree = [
      {
        title: 'Root',
        children: [],
      },
    ];

    const expected = [
      { title: 'Root', hier: 0, outline: '0' },
    ];

    const result = flattenTree(tree);
    console.log('Flattened Single Node Tree:', result); // Add this line to print the result
    expect(result).toEqual(expected);
  });
});