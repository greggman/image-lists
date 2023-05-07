
const numImages = 94979;

const numPerSlice = 50;

export default async function getRandomImage() {
  const id = numImages * Math.random() | 0;
  const sliceId = (id / numPerSlice | 0).toString().padStart(5, '0');
  const parts = /^(\d+)(\d)(\d)(\d)(\d)$/.exec(sliceId).slice(1);
  const file = `${parts.pop()}.json`;
  const filename = ['images', ...parts, file].join('/');
  const url = new URL(filename, import.meta.url);
  const res = await fetch(url.href);
  const slice = await res.json();
  const data = slice[id % numPerSlice];
  if (data.url.includes('flickr.com')) {
    data.url = data.url.replace(/_[a-z]\.jpg/, '_b.jpg');
  }
  return data;
}
