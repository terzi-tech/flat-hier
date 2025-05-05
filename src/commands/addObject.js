// src/commands/addObject.js
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { computeOutlines } from '../index.js';

// ──────────────────────────────────────────────────────────
// Load template JSON via fs to avoid the experimental JSON-module warning
// ──────────────────────────────────────────────────────────
const __filename   = fileURLToPath(import.meta.url);
const __dirname    = dirname(__filename);
const templatePath = join(__dirname, '../../templates/newObjectTemplate.json');

let template;
try {
  const raw = fs.readFileSync(templatePath, 'utf8');
  template  = JSON.parse(raw);
} catch (err) {
  console.error(`Failed to load template at ${templatePath}:`, err);
  process.exit(1);
}

/**
 * Inserts a new object immediately after the currently selected item,
 * assigns it a UUID, and recomputes outlines for the entire list.
 *
 * @param {Array<Object>} data - The flat-array representation of your tree.
 * @param {number} selectedIndex - Index of the item after which to insert.
 * @returns {{ data: Array<Object>, selectedIndex: number } | void}
 */
export async function addObject(data, selectedIndex) {
  // 1. Validate selection
  if (
    selectedIndex == null ||
    selectedIndex < 0 ||
    selectedIndex >= data.length
  ) {
    console.error(
      '⚠️  Invalid selection. Please select a valid item before adding a new object.'
    );
    return;
  }

  // 2. Prepare new object based on external template
  const parentHier = data[selectedIndex].hier;
  const newObject  = {
    ...template,                      // load defaults from JSON
    unique_id: crypto.randomUUID(),  // override with fresh UUID
    hier:      parentHier,           // inherit parent's hierarchy
    outline:   'pending'             // placeholder until computeOutlines runs
  };

  // 3. Insert and update selection
  const insertPos = selectedIndex + 1;
  data.splice(insertPos, 0, newObject);
  selectedIndex = insertPos;

  // 4. Recompute outlines for the entire data array
  computeOutlines(data);

  return { data, selectedIndex };
}
