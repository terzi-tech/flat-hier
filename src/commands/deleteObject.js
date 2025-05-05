// src/commands/deleteObject.js
import { computeOutlines } from '../index.js';

/**
 * Deletes the object at the given index, updates the selection,
 * and recomputes outlines for the remaining items.
 *
 * @param {Array<Object>} data - The flat-array representation of your tree.
 * @param {number|null} selectedIndex - Index of the item to delete.
 * @returns {{ data: Array<Object>, selectedIndex: number|null } | void}
 */
export async function deleteObject(data, selectedIndex) {
  // ──────────────────────────────────────────────────────────
  // 1. Validate selection
  // ──────────────────────────────────────────────────────────
  const isIndexInvalid =
    selectedIndex == null ||
    selectedIndex < 0 ||
    selectedIndex >= data.length;

  if (isIndexInvalid) {
    console.error(
      '⚠️  Invalid selection. Please select a valid item before deleting.'
    );
    return;
  }

  // ──────────────────────────────────────────────────────────
  // 2. Remove the selected item
  // ──────────────────────────────────────────────────────────
  data.splice(selectedIndex, 1);

  // ──────────────────────────────────────────────────────────
  // 3. Compute the new selectedIndex
  // ──────────────────────────────────────────────────────────
  const hasItemsRemaining = data.length > 0;
  const newSelectedIndex = hasItemsRemaining
    ? Math.max(0, selectedIndex - 1)
    : null;

  // ──────────────────────────────────────────────────────────
  // 4. Recompute outlines
  // ──────────────────────────────────────────────────────────
  computeOutlines(data);

  // ──────────────────────────────────────────────────────────
  // 5. Return updated state
  // ──────────────────────────────────────────────────────────
  return { data, selectedIndex: newSelectedIndex };
}
