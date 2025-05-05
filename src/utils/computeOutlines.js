// computeOutlines.js

/**
 * Computes outline numbers based on hier and position.
 * @param {Array} items - Array of objects with at least a 'hier' field.
 * @returns {Array} items with 'outline' field added
 */
export function computeOutlines(items) {
    const counters = [-1]; // Start so first item becomes "0"
    let prevLevel = 0;
  
    for (const item of items) {
      const level = item.hier;
  
      if (level > prevLevel) {
        // Deeper: initialize new levels
        for (let lvl = prevLevel + 1; lvl <= level; lvl++) {
          counters[lvl] = 1;
        }
      } else if (level < prevLevel) {
        // Up: remove deeper counters, increment this level
        counters.splice(level + 1);
        counters[level]++;
      } else {
        // Same level: increment
        counters[level]++;
      }
  
      prevLevel = level;
      item.outline = counters.join('.');
    }
  
    return items;
  }
  