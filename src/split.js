import fs from 'fs';
import path from 'path';

async function main() {
  const images = JSON.parse(fs.readFileSync('image-list.json', {encoding: 'utf-8'}));

  {
    let js = fs.readFileSync('src/get-random-image-template.js', {encoding: 'utf-8'});
    js = js.replace('numImages = 0', `numImages = ${images.length}`);
    fs.writeFileSync('get-random-image.js', js);
  }

  const numPerSlice = 50;
  for (let i = 0; i < images.length; i += numPerSlice) {
    const slice = images.slice(i, i + numPerSlice);
    const sliceId = (i / numPerSlice).toString().padStart(5, '0');
    const parts = /^(\d+)(\d)(\d)(\d)(\d)$/.exec(sliceId).slice(1);
    const file = `${parts.pop()}.json`;
    const filename = path.join('images', ...parts, file);
    fs.mkdirSync(path.dirname(filename), {recursive: true});
    fs.writeFileSync(filename, JSON.stringify(slice));
  }
}

main();