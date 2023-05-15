import fs from 'fs';
import path from 'path';
import {log, logInPlace} from './log.js';

async function main() {
  const dir = 'lists';
  const files = fs.readdirSync(dir)
    .filter(n => n.endsWith('.json'))
    .map(v => path.join(dir, v));

  const all = {};
  for (const file of files) {
    logInPlace('reading:', file);
    const data = JSON.parse(fs.readFileSync(file, {encoding: 'utf-8'}));
    log(`${file}: entries = ${data.length}`);
    for (const img of data) {
      all[img.url] = img;
    }
  }

  const asArray = [...Object.values(all)];
  log('num entries:', asArray.length);
  fs.writeFileSync('image-list.json', JSON.stringify(asArray));
}

main();