import { createAsciiTree } from '../../src/index.js';

export async function renderToConsole(data, selectedIndex) {
    const tree = await createAsciiTree(data);

    // Get the first line of the tree, root node
    const rootNode = tree[0];
    // Remove the first line from the tree
    tree.shift();
    // Adjust the selected index to account for the removed root node
    selectedIndex = Math.max(0, selectedIndex - 1);

    // Get the terminal size and calculate visible range
    const visibleRange = calculateVisibleRange(tree, selectedIndex);

    // Clear the console and render the visible tree
    clearConsole();
    renderTreeWithHighlight(tree, visibleRange, selectedIndex, rootNode);
}

// Helper: Calculate the visible range of the tree
function calculateVisibleRange(tree, selectedIndex) {
    const [, height] = process.stdout.getWindowSize();
    const startIndex = Math.max(0, selectedIndex - Math.floor(height / 2));
    const endIndex = Math.min(tree.length, startIndex + height - 4); // Reserve space for header/footer
    return { startIndex, endIndex };
}

// Helper: Clear the console
function clearConsole() {
    process.stdout.write('\x1b[2J\x1b[H');
}

// Helper: Render the tree with the selected index highlighted and shortcuts
function renderTreeWithHighlight(tree, visibleRange, selectedIndex, rootNode) {
    const { startIndex, endIndex } = visibleRange;
    const visibleTree = tree.slice(startIndex, endIndex);

    // Render the root node at the top
    process.stdout.write(rootNode);

    // Render the rest of the visible tree
    visibleTree.forEach((line, index) => {
        if (index === selectedIndex - startIndex) {
            highlightLine(line); // Highlight the selected line
        } else {
            process.stdout.write(line);
        }
    });

    // Render shortcuts at the bottom
    renderShortcuts();
}

// Helper: Highlight a line
function highlightLine(line) {
    process.stdout.write(`\x1b[7m${line}\x1b[0m`); // Inverted colors
}

// Helper: Render shortcut descriptions at the bottom of the console
function renderShortcuts() {
    const shortcuts = "↑↓ Nav | ↵ Select | Esc Quit | ⇥ Demote | ⇧⇥ Promote | ⇧↓ Item Down | ⇧↑ Item Up";
    const [, width] = process.stdout.getWindowSize();
    const paddedShortcuts = shortcuts.padEnd(width, ' ');
    process.stdout.write(`\n${paddedShortcuts}`);
}

