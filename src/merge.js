import fs from 'fs';
import path from 'path';

async function main() {
  const dir = 'lists';
  const files = fs.readdirSync(dir)
    .filter(n => n.endsWith('.json'))
    .map(v => path.join(dir, v));

  const all = {};
  for (const file of files) {
    console.log('reading:', file);
    const data = JSON.parse(fs.readFileSync(file, {encoding: 'utf-8'}))   ;
    for (const img of data) {
      all[img.url] = img;
    }
  }
  const asArray = [...Object.values(all)];
  console.log('num entries:', asArray.length);
  fs.writeFileSync('image-list.json', JSON.stringify(asArray));
}

main();