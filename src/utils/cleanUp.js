import path from 'path';
import { cleanupStaleTemps } from "../../bin/cli.js";

export function cleanUp(state) {
    // Call cleanupStaleTemps or any other cleanup logic here
    cleanupStaleTemps(path.dirname(state.ds.filePath));
    console.clear();
    console.log('\nExiting fhr...');
    process.stdout.write('\x1B[?25h'); // show cursor
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.exit(0);
}