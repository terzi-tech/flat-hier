/**
 * Moves a node (and its entire subtree) up one position among its siblings
 * and reassigns new outline numbers for all nodes.
 * @param {Array<{ unique_id: string, title: string, hier: number, outline: string }>} items
 * @param {string} outlineToMove - The outline number of the node to move (e.g. "2.1").
 * @returns {Array} A new array with updated hier and outline fields.
 */
export function moveUp(items, outlineToMove) {
    // Build node objects with children
    const nodeMap = {};
    const nodes = items.map(i => ({ ...i, children: [] }));
    nodes.forEach(n => (nodeMap[n.outline] = n));
    const roots = [];
    nodes.forEach(n => {
      const parts = n.outline.split('.');
      if (parts.length === 1) roots.push(n);
      else {
        const parent = nodeMap[parts.slice(0, -1).join('.')];
        parent.children.push(n);
      }
    });
  
    // Helper to find and swap with previous sibling
    function swapInParentUp(targetOutline) {
      const parts = targetOutline.split('.');
      const parentArr = parts.length === 1
        ? roots
        : nodeMap[parts.slice(0, -1).join('.')].children;
      const idx = parentArr.findIndex(n => n.outline === targetOutline);
      if (idx <= 0) return false;
      [parentArr[idx - 1], parentArr[idx]] = [parentArr[idx], parentArr[idx - 1]];
      return true;
    }
  
    // Attempt swap up
    if (!swapInParentUp(outlineToMove)) return items;
  
    // Flatten tree back into an array, reassigning outlines
    const newItems = [];
    function flatten(arr, prefix = []) {
      arr.forEach((n, idx) => {
        const segment = prefix.length === 0 ? idx : idx + 1;
        const newOutline = [...prefix, segment].join('.');
        n.outline = newOutline;
        n.hier = prefix.length;
        newItems.push({ unique_id: n.unique_id, title: n.title, hier: n.hier, outline: n.outline });
        if (n.children.length) flatten(n.children, [...prefix, segment]);
      });
    }
  
    flatten(roots);
    return newItems;
  }