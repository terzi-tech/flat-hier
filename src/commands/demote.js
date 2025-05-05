/**
 * Demotes a node (and its entire subtree) one level deeper in the hierarchy,
 * making it the last child of its immediate previous sibling.
 * @param data - array of items representing the tree structure
 * @param selectedIndex - index of the selected item to be demoted
 * @returns updated data array
 */
export function demote(data, selectedIndex) {

    const outlineToDemote = data[selectedIndex]?.outline;

    if (!outlineToDemote) {
        return data; // Return unchanged data if no valid selection
    }

    const { roots, nodeMap } = buildTree(data);

    // Locate node and its siblings
    const parts = outlineToDemote.split('.');
    const parentArr = parts.length === 1
      ? roots
      : nodeMap[parts.slice(0, -1).join('.')].children;
    const idx = parentArr.findIndex(n => n.outline === outlineToDemote);
    if (idx <= 0) return data; // can't demote first item

    // Remove from current siblings
    const [node] = parentArr.splice(idx, 1);

    // Previous sibling becomes new parent
    const prevSibling = parentArr[idx - 1];
    prevSibling.children = prevSibling.children || [];
    prevSibling.children.push(node);

    return flattenTree(roots); // Return the updated data
}

/**
 * Utility: builds a tree structure and index map from flat items
 */
function buildTree(items) {
    const nodes = items.map(i => ({ ...i, children: [] }));
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.outline] = n; });
    const roots = [];
    nodes.forEach(n => {
        const parts = n.outline.split('.');
        if (parts.length === 1) roots.push(n);
        else nodeMap[parts.slice(0, -1).join('.')].children.push(n);
    });
    return { roots, nodeMap };
}

/**
 * Utility: flattens a tree back to an array, recalculating outline & hier
 */
function flattenTree(roots) {
    const result = [];
    function recurse(arr, prefix = []) {
        arr.forEach((n, idx) => {
            const segment = prefix.length === 0 ? idx : idx + 1;
            const newOutline = [...prefix, segment].join('.');
            const updatedNode = { ...n };
            updatedNode.hier = prefix.length; // Update 'hier' property
            updatedNode.outline = newOutline; // Update 'outline' property
            updatedNode.children = undefined; // Remove children to avoid circular references
            result.push(updatedNode);
            if (n.children.length) recurse(n.children, [...prefix, segment]);
        });
    }
    recurse(roots);
    return result;
}