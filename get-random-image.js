const numImages = 52031;

const numPerSlice = 50;

export default async function getRandomImage() {
  const id = numImages * Math.random() | 0;
  const sliceId = (id / numPerSlice | 0).toString().padStart(5, '0');
  console.log(sliceId);
  const parts = /^(\d+)(\d)(\d)(\d)(\d)$/.exec(sliceId).slice(1);
  const file = `${parts.pop()}.json`;
  const filename = ['images', ...parts, file].join('/');
  const url = new URL(filename, import.meta.url);
  console.log(url.href);
  const res = await fetch(url.href);
  const slice = await res.json();
  return slice[id % numPerSlice];
}