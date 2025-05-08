#!/usr/bin/env node
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  renderToConsole,
  DataService,
  addObject,
  computeOutlines,
  demote,
  promote,
  moveDown,
  moveUp,
  deleteObject
} from '../src/index.js';
import commandRegistry from '../src/cli/commandRegistry.js';

/* ──────────────────────────────────────────────────────────
   CONFIG & STATE
────────────────────────────────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Update the configPath to point to the configuration file in the package directory
const configPath = path.resolve(__dirname, '../flat-hier.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const templateFilePath = path.resolve(process.cwd(), config.templateFileName);
const treeDataFilePath = path.resolve(process.cwd(), config.filepath);

// Centralized application state
export const state = {
  ds:      new DataService(treeDataFilePath),
  data:    [],
  selectedIndex: 1,
  mode:    'navigate',   // 'navigate' | 'edit'
  editBuffer: ''
};

/* ──────────────────────────────────────────────────────────
   BOOTSTRAP & RENDERING
────────────────────────────────────────────────────────── */
export async function boot() {
  try {
    console.log('Loading JSON data...');
    await state.ds.loadData();
    state.data = state.ds.getData();
    render();
    showHelp();
  } catch (err) {
    console.error('Failed to load JSON:', err);
    process.exit(1);
  }
}

function render() {
  renderToConsole(state.data, state.selectedIndex);
}

/* ──────────────────────────────────────────────────────────
   HELP & CLEANUP
────────────────────────────────────────────────────────── */
function showHelp() {
  console.log('Controls:');
  console.log('  ↑   Move up');
  console.log('  ↓   Move down');
  console.log('  ENTER  Edit title');
  console.log('  ESC    Exit / Cancel edit');
  console.log('  Ctrl+N Add new object');
  console.log('  DEL    Delete object');
  console.log('  →     Demote');
  console.log('  ←     Promote');
}

function cleanupStaleTemps(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory does not exist: ${dir}`);
    return;
  }

  fs.readdirSync(dir)
    .filter(f => f.endsWith('.tmp'))
    .forEach(tmp => {
      console.warn('Found stale temp file:', tmp);
      // optionally: fs.unlinkSync(path.join(dir, tmp));
    });
}

// e.g. call cleanupStaleTemps(path.dirname(state.ds.filePath)) in boot()

export function cleanup() {
  cleanupStaleTemps(path.dirname(state.ds.filePath));
  console.clear();
  console.log('\nExiting.');
  process.stdout.write('\x1B[?25h'); // show cursor
  process.stdin.setRawMode(false);
  process.stdin.pause();
  process.exit(0);
}


/* ──────────────────────────────────────────────────────────
   NAVIGATION & SELECTION
────────────────────────────────────────────────────────── */
function moveSelection(delta) {
  state.selectedIndex = Math.min(
    Math.max(1, state.selectedIndex + delta),
    state.data.length - 1
  );
  render();
}

/* ──────────────────────────────────────────────────────────
   EDIT MODE
────────────────────────────────────────────────────────── */
function startEdit() {
  state.mode = 'edit';
  state.editBuffer = '';
  // Move cursor to line and clear it
  const [, h] = process.stdout.getWindowSize();
  const offset = Math.max(0, state.selectedIndex - Math.floor(h / 2));
  const row    = state.selectedIndex - offset + 1;
  process.stdout.write(`\x1b[${row};1H\x1b[2KEnter Title: `);
  process.stdout.write('\x1B[?25h'); // show cursor
}

function cancelEdit() {
  console.log('\nEdit cancelled.');
  exitEdit();
}

async function saveEdit() {
  const newTitle = state.editBuffer.trim();
  if (newTitle) {
    // Reload the latest data from the file
    await state.ds.loadData();
    const latestData = state.ds.getData();

    // Update the title in the latest data
    latestData[state.selectedIndex].title = newTitle;

    // Persist the updated data
    await persist(latestData);

    // Update in-memory state
    state.data = latestData;
    render();
  } else {
    console.log('\nNo changes made.');
  }
  exitEdit();
}

function exitEdit() {
  state.mode = 'navigate';
  state.editBuffer = '';
  process.stdout.write('\x1B[?25l'); // hide cursor
  render();
}

/* ──────────────────────────────────────────────────────────
   DATA PERSISTENCE HELPER
────────────────────────────────────────────────────────── */
// 1. Atomic write helper
function atomicSave(filePath, dataString) {
  const dir     = path.dirname(filePath);
  const name    = path.basename(filePath);
  const tmpPath = path.join(dir, `${name}.tmp`);

  // Write full data to temp file
  fs.writeFileSync(tmpPath, dataString, 'utf8');

  // Atomically replace the real file
  fs.renameSync(tmpPath, filePath);
}

// 2. Updated persist()
async function persist(updatedData) {
  const json = JSON.stringify(updatedData, null, 2);

  // Safely write via atomicSave
  atomicSave(state.ds.filePath, json);

  // Reload into memory to keep data in sync
  await state.ds.loadData();
  state.data = state.ds.getData();
}

/* ──────────────────────────────────────────────────────────
   OBJECT OPERATIONS
────────────────────────────────────────────────────────── */
async function addObjectHandler() {
  // Get unique id from the selected item
  const selectedItem = state.data[state.selectedIndex];
  if (!selectedItem) {
    console.error('No valid item selected.');
    return;
  }
  const uniqueId = selectedItem.unique_id;
  // Get the outline number of the selected item
  const outlineNumber = state.data[state.selectedIndex]?.outline;
  if (!outlineNumber) {
    console.error('No valid outline number found for the selected index.');
    return;
  }

  const res = await addObject(state.data, outlineNumber);
  if (res) {
    state.data = res.data;
    state.selectedIndex = res.selectedIndex;
    await persist(state.data);
    startEdit();
  }
}

async function deleteObjectHandler() {
    // Get unique id from the selected item
    const selectedItem = state.data[state.selectedIndex];
    if (!selectedItem) {
      console.error('No valid item selected.');
      return;
    }
    // Get the outline number of the selected item
    const outlineNumber = state.data[state.selectedIndex]?.outline;
  const res = await deleteObject(state.data, outlineNumber);
  if (res) {
    state.data = res.data;

    await persist(state.data);
    render();
    console.log('Item deleted.');
  }
}

async function demoteHandler() {
  // Get unique id from the selected item
  const selectedItem = state.data[state.selectedIndex];
  const uniqueId = selectedItem?.unique_id;
  if (!selectedItem) {
    console.error('No valid item selected.');
    return;
  }
  // Get the outline number of the selected item
  const outlineNumber = state.data[state.selectedIndex]?.outline;

  const updated = demote(state.data, outlineNumber);
  if (updated) {
    await persist(updated);
    // Set the selected index to item with the same unique id
    const newIndex = updated.findIndex(item => item.unique_id === uniqueId);
    state.selectedIndex = newIndex !== -1 ? newIndex : state.selectedIndex;
    render();
  }
}

async function promoteHandler() {
  const outline = state.data[state.selectedIndex]?.outline;
  if (!outline) {
    console.error('No valid outline found for the selected index.');
    return;
  }
  const selectedItem = state.data[state.selectedIndex];
  const uniqueId = selectedItem?.unique_id;
  if (!selectedItem) {
    console.error('No valid item selected.');
    return;
  }
  const updated = promote(state.data, outline);
  if (updated) {
    await persist(updated);
      // Set the selected index to item with the same unique id
      const newIndex = updated.findIndex(item => item.unique_id === uniqueId);
      state.selectedIndex = newIndex !== -1 ? newIndex : state.selectedIndex;
    render();
  }
}

async function moveDownHandler() {
  const outline = state.data[state.selectedIndex].outline;
  let updated   = moveDown(state.data, outline);
  if (updated) {
    updated = computeOutlines(updated);
    await persist(updated);
    state.selectedIndex = Math.min(state.selectedIndex + 1, state.data.length - 1);
    render();
  }
}

async function moveUpHandler() {
  const outline = state.data[state.selectedIndex].outline;
  let updated   = moveUp(state.data, outline);
  if (updated) {
    updated = computeOutlines(updated);
    await persist(updated);
    state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
    render();
  }
}

/* ──────────────────────────────────────────────────────────
   INPUT MAPPING
────────────────────────────────────────────────────────── */
const keyMap = {
  navigate: {
    '\u0003': cleanup,       // Ctrl+C
    escape: cleanup,
    up:    () => moveSelection(-1),
    down:  () => moveSelection(1),
    return: startEdit,
    '\u000e': addObjectHandler, // Ctrl+N
    delete: deleteObjectHandler,
    right:  demoteHandler,      // Changed from tab to right arrow
    left:   promoteHandler      // Changed from shiftTab to left arrow
  },
  edit: {
    escape: cancelEdit,
    return: saveEdit
  }
};

// Initialize readline & keypress
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdout.write('\x1B[?25l'); // hide cursor on start

let keypressActive = false; // Flag to ensure single listener

if (!keypressActive) {
    process.stdin.on('keypress', async (str, key) => {

        // Normalize key id
        const id = key.sequence === '\u001b[A' ? 'up'
                 : key.sequence === '\u001b[B' ? 'down'
                 : key.sequence === '\u001b[C' ? 'right' // Right arrow
                 : key.sequence === '\u001b[D' ? 'left'  // Left arrow
                 : key.sequence === '\u007f'   ? 'delete'
                 : key.name || str;

        // Dispatch control-N separately
        if (key.ctrl && key.name === 'n') {
            return addObjectHandler();
        }

        // Shift+Arrow handlers
        if (key.shift && key.name === 'down') {
            return moveDownHandler();
        }
        if (key.shift && key.name === 'up') {
            return moveUpHandler();
        }

        // Mode-specific mapping
        const handler = keyMap[state.mode]?.[id];
        if (handler) {
            return handler();
        }

        // In-edit typing
        if (state.mode === 'edit' && key.sequence && !key.ctrl && !key.meta) {
            if (key.name === 'backspace') {
                state.editBuffer = state.editBuffer.slice(0, -1);
                process.stdout.write('\b \b');
            } else {
                state.editBuffer += str;
                process.stdout.write(str);
            }
        }
    });
    keypressActive = true; // Mark listener as active
}

/* ──────────────────────────────────────────────────────────
   START
────────────────────────────────────────────────────────── */
const [,, command, ...args] = process.argv;

if (commandRegistry[command]) {
    commandRegistry[command](...args);
} else {
    console.error(`Unknown command: ${command}`);
    console.log('Available commands: init, edit');
    // Close the process if no command is found
    process.exit(1);
}

commandRegistry.edit = () => {
  console.log('Starting edit mode...');
    boot();
};


