import { createAsciiTree } from '../../src/index.js';

let previousState = [];

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

    // Generate the new state of the console
    const newState = generateConsoleState(tree, visibleRange, selectedIndex, rootNode);

    // Calculate the diff between the previous and new states
    const diffIndices = calculateDiff(previousState, newState);

    // Clear and rerender only the changed lines
    diffIndices.forEach(index => {
        process.stdout.write(`\x1b[${index + 1};1H`); // Move to the line
        process.stdout.write(`\x1b[2K`);             // Clear the entire line
        process.stdout.write(newState[index]);       // Write the updated line
    });

    // Update the previous state
    previousState = newState;
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

function generateConsoleState(tree, visibleRange, selectedIndex, rootNode) {
    const { startIndex, endIndex } = visibleRange;
    const visibleTree = tree.slice(startIndex, endIndex);

    const state = [];

    // Add the root node to the state
    state.push(rootNode);

    // Add the visible tree lines to the state
    visibleTree.forEach((line, index) => {
        if (index === selectedIndex - startIndex) {
            state.push(`\x1b[7m${line}\x1b[0m`); // Highlight the selected line
        } else {
            state.push(line);
        }
    });

    // Add the shortcuts to the state
    const [, height] = process.stdout.getWindowSize();
    while (state.length < height - 1) {
        state.push(''); // Fill empty lines
    }
    state.push(renderShortcutsToString());

    return state;
}

function calculateDiff(prev, next) {
    const diffIndices = [];
    const maxLength = Math.max(prev.length, next.length);

    for (let i = 0; i < maxLength; i++) {
        if (prev[i] !== next[i]) {
            diffIndices.push(i);
        }
    }

    return diffIndices;
}

function renderShortcutsToString() {
    const shortcuts = "\u2191\u2193 Nav | \u21b5 Edit Title | Esc Quit | \u2192 Demote | \u2190 Promote | \u21e7\u2193 Item Down | \u21e7\u2191 Item Up";
    return `\x1b[7m${shortcuts}\x1b[0m`;
}

