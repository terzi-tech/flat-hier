import { describe, it, expect, vi, beforeAll } from 'vitest';
import { deleteObject } from '../src/core/deleteObject.js';
import * as compute from '../src/utils/computeOutlines.js';
import * as utils from '../src/utils/exitWithoutClear.js';

vi.mock('../src/utils/computeOutlines.js');
vi.mock('../src/utils/exitWithoutClear.js', () => ({
  exitWithoutClear: vi.fn(),
}));

beforeAll(() => {
  vi.spyOn(process, 'stdin', 'get').mockReturnValue({
    setRawMode: vi.fn(),
    resume: vi.fn(),
    setEncoding: vi.fn(),
    pause: vi.fn(),
  });
});

describe('deleteObject', () => {
  it('should delete the object with the specified outline number and update the selection', () => {
    const data = [
      { outline: '1', hier: 'root' },
      { outline: '1.1', hier: 'child' },
      { outline: '1.2', hier: 'child' }
    ];
    const outlineNumber = '1.1';

    const result = deleteObject(data, outlineNumber);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(2);
    expect(result.data[0].outline).toBe('1');
    expect(result.data[1].outline).toBe('1.2');
    expect(result.selectedIndex).toBe(1);
  });

  it('should return null for selectedIndex if the last item is deleted', () => {
    const data = [{ outline: '1', hier: 'root' }];
    const outlineNumber = '1';

    const result = deleteObject(data, outlineNumber);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(0);
    expect(result.selectedIndex).toBeNull();
  });

  it('should return void if the outline number is invalid', () => {
    const data = [{ outline: '1', hier: 'root' }];
    const outlineNumber = '2';

    const result = deleteObject(data, outlineNumber);

    expect(result).toBeUndefined();
  });

  it('should call computeOutlines after deletion', () => {
    const data = [
      { outline: '1', hier: 'root' },
      { outline: '1.1', hier: 'child' }
    ];
    const outlineNumber = '1';

    deleteObject(data, outlineNumber);

    expect(compute.computeOutlines).toHaveBeenCalled();
  });
});