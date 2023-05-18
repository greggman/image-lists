import fs from 'fs';
import path from 'path';

async function main() {
  fs.mkdirSync('out', { recursive: true });

  fs.copyFileSync('index.html', 'out/index.html');
  fs.copyFileSync('CNAME', 'out/CNAME');

  const images = JSON.parse(fs.readFileSync('image-list.json', {encoding: 'utf-8'}));

  {
    let js = fs.readFileSync('src/get-random-image-template.js', {encoding: 'utf-8'});
    js = js.replace('numImages = 0', `numImages = ${images.length}`);
    fs.writeFileSync('out/get-random-image.js', js);
    fs.writeFileSync('out/num-images.json', JSON.stringify({numImages: images.length}));
    console.log('num images:', images.length);
    console.log('num files:', (images.length + 49) / 50 | 0);
  }

  const numPerSlice = 50;
  for (let i = 0; i < images.length; i += numPerSlice) {
    const slice = images.slice(i, i + numPerSlice);
    const sliceId = (i / numPerSlice).toString().padStart(5, '0');
    const parts = /^(\d+)(\d)(\d)(\d)(\d)$/.exec(sliceId).slice(1);
    const file = `${parts.pop()}.json`;
    const filename = path.join('out', 'images', ...parts, file);
    fs.mkdirSync(path.dirname(filename), {recursive: true});
    fs.writeFileSync(filename, JSON.stringify(slice));
  }
}

main();
