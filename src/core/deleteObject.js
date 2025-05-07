// src/commands/deleteObject.js
import { computeOutlines } from '../utils/computeOutlines.js';

/**
 * Deletes the object at the given index, updates the selection,
 * and recomputes outlines for the remaining items.
 *
 * @param {Array<Object>} data - The flat-array representation of your tree.
 * @param {number|null} selectedIndex - Index of the item to delete.
 * @returns {{ data: Array<Object>, selectedIndex: number|null } | void}
 */
export function deleteObject(data, selectedIndex) {
  if (selectedIndex < 0 || selectedIndex >= data.length) {
    console.error(
      `⚠️  Invalid selection. Please select a valid item before deleting.`
    );
    return;
  }

  // Remove the selected item
  data.splice(selectedIndex, 1);

  // Update the selected index
  const newSelectedIndex = data.length > 0 ? Math.max(0, selectedIndex) : null;

  // Recompute outlines for the entire data array
  computeOutlines(data);

  return { data, selectedIndex: newSelectedIndex };
}
