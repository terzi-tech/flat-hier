import { describe, it, expect } from 'vitest';
import { demote } from '../src/core/demote.js';

describe('demote', () => {
  it('should demote a node to be the last child of its previous sibling', () => {
    const data = [
    { outline: '0', title: 'Root 1' },
      { outline: '1', title: 'Root 2' },
      { outline: '1.1', title: 'Child 1.1' },
      { outline: '1.2', title: 'Child 1.2' },
      { outline: '2', title: 'Root 3' }
    ];
    
    const result = demote(data, '1.2');

    expect(result).toHaveLength(5);
    expect(result[0].outline).toBe('0');
    expect(result[1].outline).toBe('1');
    expect(result[2].outline).toBe('1.1');
    expect(result[3].outline).toBe('1.1.1');
    expect(result[4].outline).toBe('2');
  });

  it('should return the original data if the node cannot be demoted', () => {
    const data = [
      { outline: '1', title: 'Root 1' },
      { outline: '1.1', title: 'Child 1.1' }
    ];

    const result = demote(data, '1');

    expect(result).toEqual(data);
  });

  it('should return the original data if the outlineToDemote is invalid', () => {
    const data = [
      { outline: '1', title: 'Root 1' },
      { outline: '1.1', title: 'Child 1.1' }
    ];

    const result = demote(data, '2');

    expect(result).toEqual(data);
  });

  it('should return the original data if no outlineToDemote is provided', () => {
    const data = [
      { outline: '1', title: 'Root 1' },
      { outline: '1.1', title: 'Child 1.1' }
    ];

    const result = demote(data, null);

    expect(result).toEqual(data);
  });
});