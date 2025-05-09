// Exit without clearing console
export function exitWithoutClear() {
  console.log('\nExiting fhr...');

  process.stdout.write('\x1B[?25h'); // show cursor
  process.stdin.setRawMode(false);
  process.stdin.pause();

  process.exit(0);
}