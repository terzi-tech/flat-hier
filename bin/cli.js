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
import { JSONtoMD, writeMarkdownToFile } from '../src/parsers/JSONtoMD.js';

/* ──────────────────────────────────────────────────────────
   CONFIG & STATE
────────────────────────────────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load config and derive paths
const configPath         = path.resolve(__dirname, '../reqtext_config.json');
const config             = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const templateFilePath   = path.resolve(__dirname, `../../templates/${config.templateFileName}`);
const treeDataFilePath   = path.resolve(__dirname, `../${config.filepath}`);

// Centralized application state
const state = {
  ds:      new DataService(treeDataFilePath),
  data:    [],
  selectedIndex: 1,
  mode:    'navigate',   // 'navigate' | 'edit'
  editBuffer: ''
};

/* ──────────────────────────────────────────────────────────
   BOOTSTRAP & RENDERING
────────────────────────────────────────────────────────── */
async function boot() {
  try {
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
  console.log('  TAB    Demote');
  console.log('  Shift+TAB Promote');
}

function cleanupStaleTemps(dir) {
  fs.readdirSync(dir)
    .filter(f => f.endsWith('.tmp'))
    .forEach(tmp => {
      console.warn('Found stale temp file:', tmp);
      // optionally: fs.unlinkSync(path.join(dir, tmp));
    });
}

// e.g. call cleanupStaleTemps(path.dirname(state.ds.filePath)) in boot()

function cleanup() {
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
    state.data[state.selectedIndex].title = newTitle;
    await persist(state.data);
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
  const res = await addObject(state.data, state.selectedIndex, templateFilePath);
  if (res) {
    state.data = res.data;
    state.selectedIndex = res.selectedIndex;
    await persist(state.data);
    startEdit();
  }
}

async function deleteObjectHandler() {
  if (!state.data.length) return console.log('No items to delete.');
  const res = await deleteObject(state.data, state.selectedIndex);
  if (res) {
    state.data = res.data;
    state.selectedIndex = res.selectedIndex;
    await persist(state.data);
    render();
    console.log('Item deleted.');
  }
}

async function demoteHandler() {
  const updated = demote(state.data, state.selectedIndex);
  if (updated) {
    await persist(updated);
    render();
  }
}

async function promoteHandler() {
  const updated = promote(state.data, state.selectedIndex);
  if (updated) {
    await persist(updated);
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
    tab:    demoteHandler,
    shiftTab: promoteHandler
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

process.stdin.on('keypress', async (str, key) => {
  // Normalize key id
  const id = key.sequence === '\u001b[A' ? 'up'
           : key.sequence === '\u001b[B' ? 'down'
           : key.sequence === '\u007f'   ? 'delete'
           : key.sequence === '\u001b[Z' ? 'shiftTab'
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

/* ──────────────────────────────────────────────────────────
   START
────────────────────────────────────────────────────────── */
boot();

// Check for --jsontomd flag
if (process.argv.includes('--jsontomd')) {
    (async () => {
        try {
            // Load data using DataService
            const ds = new DataService(treeDataFilePath);
            await ds.loadData();
            const data = ds.getData();

            // Convert JSON to Markdown
            const markdown = JSONtoMD(data);

            // Write Markdown to file
            const outputFilePath = path.resolve(__dirname, '../output.md');
            await writeMarkdownToFile(markdown, outputFilePath);

            console.log(`Markdown file generated at: ${outputFilePath}`);
        } catch (error) {
            console.error('Error during JSON to Markdown conversion:', error);
        }
        process.exit(0);
    })();
}
