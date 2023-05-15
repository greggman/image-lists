const isTTY = process.stdout.isTTY
let lineHasContent = false;

function writeLine(s) {
  if (lineHasContent && isTTY) {
    process.stdout.write('\r\x1b[K');
  }
  process.stdout.write(s);
  const endsWithLF = s.endsWith('\n');
  lineHasContent = !endsWithLF; 
  if (!isTTY && lineHasContent) {
    process.stdout.write('\n');
  }
}

export function logInPlace(...args) {
  writeLine(args.join(' '));
}

export function log(...args) {
  writeLine(`${args.join(' ')}\n`);
}