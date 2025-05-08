import { createAsciiTree } from '../../src/index.js';

let _lastRendered = {
  lines: [],         // array of strings (with trailing “\n”)
  highlighted: null, // which index was inverted last time
  root: ''           // the rootNode line
};

export async function renderToConsole(data, selectedIndex) {
  const tree       = await createAsciiTree(data);
  const rootNode   = tree[0];
  const bodyLines  = tree.slice(1);
  selectedIndex    = Math.max(0, selectedIndex - 1);

  const { startIndex, endIndex } = calculateVisibleRange(bodyLines, selectedIndex);
  const visible   = bodyLines.slice(startIndex, endIndex);
  const toHighlight = selectedIndex - startIndex;

  // If root changed, rewrite it unconditionally:
  if (rootNode !== _lastRendered.root) {
    moveCursor(1, 1);
    process.stdout.write(rootNode);
    _lastRendered.root = rootNode;
  }

  // Diff each visible line against _lastRendered.lines
  visible.forEach((line, i) => {
    const oldLine = _lastRendered.lines[i] || '';
    const oldHl   = _lastRendered.highlighted;
    if (line !== oldLine || i === toHighlight || i === oldHl) {
      // move cursor to the correct row (row 2 + i, since row 1 is root)
      moveCursor(2 + i, 1);

      if (i === toHighlight)   invertWrite(line);
      else                     process.stdout.write(line);
    }
  });

  // If the height of the new visible slice is smaller, clear out old trailing lines
  if (_lastRendered.lines.length > visible.length) {
    for (let i = visible.length; i < _lastRendered.lines.length; i++) {
      moveCursor(2 + i, 1);
      process.stdout.write(' '.repeat(_lastRendered.lines[i].length)); 
    }
  }

  // Render shortcuts bar (you can diff it too, but it rarely changes size)
  renderShortcuts();

  // Save for next diff
  _lastRendered.lines       = visible;
  _lastRendered.highlighted = toHighlight;
}

function calculateVisibleRange(tree, selectedIndex) {
  const [, height] = process.stdout.getWindowSize();
  const startIndex = Math.max(0, selectedIndex - Math.floor(height / 2));
  const endIndex   = Math.min(tree.length, startIndex + height - 3);
  return { startIndex, endIndex };
}

function moveCursor(row, col = 1) {
  process.stdout.write(`\x1b[${row};${col}H`); // Move cursor
  process.stdout.write(`\x1b[2K`); // Clear the line
}

function invertWrite(line) {
  process.stdout.write(`\x1b[7m${line}\x1b[0m`);
}

function renderShortcuts() {
  const shortcuts = "↑↓ Nav | ↵ Edit Title | Esc Quit | ← → Promote/Demote | Shift + ↑↓ Move Item "
  const [width, height] = process.stdout.getWindowSize();
  moveCursor(height, 1);
  const bar = shortcuts.padEnd(width, ' ');
  process.stdout.write(`\x1b[7m${bar}\x1b[0m`);
}
