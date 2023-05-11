import puppeteer from 'puppeteer'
import path from 'path';
import fs from 'fs';

// const exampleInjectJS = fs.readFileSync('test/src/js/example-inject.js', {encoding: 'utf-8'});

function makePromiseInfo() {
  const info = {};
  const promise = new Promise((resolve, reject) => {
    Object.assign(info, {resolve, reject});
  });
  info.promise = promise;
  return info;
}

async function getImageUrls() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(200000)

  page.on('console', async e => {
    const args = await Promise.all(e.args().map(a => a.jsonValue()));
    console.log(...args);
  });

//  let waitingPromiseInfo;
//
//  page.on('domcontentloaded', async() => {
//    const failures = await page.evaluate(() => {
//      return window.testsPromiseInfo.promise;
//    });
//
//    waitingPromiseInfo.resolve();
//  });

  const groupPages = [
    { name: 'at-home.json', url: 'https://www.flickr.com/groups/flickr-at-home/pool/', },
    { name: 'wander.json', url: 'https://www.flickr.com/groups/pbwa/pool', },
    { name: 'mist.json', url: 'https://www.flickr.com/groups/2932332@N23/pool', },
    { name: 'f-ology.json', url: 'https://www.flickr.com/groups/flickrology/pool', },
    { name: 'abandoned.json', url: 'https://www.flickr.com/groups/abandoned/pool', },
    { name: 'vanish.json', url: 'https://www.flickr.com/groups/parallax/pool', },
    { name: 'catchy.json', url: 'https://www.flickr.com/groups/catchy/pool', },
    { name: 'crazy-t.json', url: 'https://www.flickr.com/groups/crazy_tuesday/pool', },
    { name: 'friday.json', url: 'https://www.flickr.com/groups/flickrfriday/pool', },
    { name: 'utata.json', url: 'https://www.flickr.com/groups/utata/pool', },
    { name: 'central.json', url: 'https://www.flickr.com/groups/central/pool', },
    { name: 'less.json', url: 'https://www.flickr.com/groups/minimally_less_is_more/pool', },
  ];

  const albums = [
    { name: 'g00.json', url: 'https://flickr.com/photos/greggman/albums/72157640592797285', },
    { name: 'g01.json', url: 'https://flickr.com/photos/greggman/albums/72157641206325234', },
    { name: 'g02.json', url: 'https://flickr.com/photos/greggman/albums/72157644327443920', },
    { name: 'g03.json', url: 'https://flickr.com/photos/greggman/albums/72157643677553054', },
    { name: 'g04.json', url: 'https://flickr.com/photos/greggman/albums/72157644688933396', },
    { name: 'g05.json', url: 'https://flickr.com/photos/greggman/albums/72157645690165002', },
    { name: 'g06.json', url: 'https://flickr.com/photos/greggman/albums/72157651307917309', },
    { name: 'g07.json', url: 'https://flickr.com/photos/greggman/albums/72157651397313460', },
    { name: 'g08.json', url: 'https://flickr.com/photos/greggman/albums/72157657699947615', },
    { name: 'g09.json', url: 'https://flickr.com/photos/greggman/albums/72157656740523763', },
    { name: 'g10.json', url: 'https://flickr.com/photos/greggman/albums/72157662179104851', },
    { name: 'g11.json', url: 'https://flickr.com/photos/greggman/albums/72157659951820263', },
    { name: 'g12.json', url: 'https://flickr.com/photos/greggman/albums/72157664774207412', },
    { name: 'g13.json', url: 'https://flickr.com/photos/greggman/albums/72157666622627132', },
    { name: 'g14.json', url: 'https://flickr.com/photos/greggman/albums/72157665436101182', },
    { name: 'g15.json', url: 'https://flickr.com/photos/greggman/albums/72157682248679032', },
    { name: 'g16.json', url: 'https://flickr.com/photos/greggman/albums/72157664685318528', },
    { name: 'g17.json', url: 'https://flickr.com/photos/greggman/albums/72157707642664275', },
    { name: 'g18.json', url: 'https://flickr.com/photos/greggman/albums/72157706858238501', },
    { name: 'g19.json', url: 'https://flickr.com/photos/greggman/albums/72157712154217288', },
    { name: 'g20.json', url: 'https://flickr.com/photos/greggman/albums/72177720297461598', },
    { name: 'g21.json', url: 'https://flickr.com/photos/greggman/albums/72157640252369544', },
    { name: 'g22.json', url: 'https://flickr.com/photos/greggman/albums/72157635450390289', },
    { name: 'g23.json', url: 'https://flickr.com/photos/greggman/albums/72157626026547251', },
    { name: 'g24.json', url: 'https://flickr.com/photos/greggman/albums/72157625547033028', },
  ];

  async function extractList(pages, mode) {
    for (const {url, js, name} of pages) {
      try {
    //    waitingPromiseInfo = makePromiseInfo();
        console.log(`===== [ ${url} ] =====`);
        const imgUrls = [];

        if (js) {
          await page.evaluateOnNewDocument(js);
        }
        await page.goto(url);
        for(let count = 0; ; ++count) {
          await page.waitForNetworkIdle();
    //      if (js) {
    //        await page.evaluate(() => {
    //          setTimeout(() => {
    //            window.testsPromiseInfo.resolve(0);
    //          }, 10);
    //        });
    //      }
    //      await waitingPromiseInfo.promise;

          await page.evaluate(() => {
            async function scroll() {
              let scrollY = 0;
              do {
                scrollY = window.scrollY;
                window.scrollBy(0, 500);
                await new Promise(resolve => setTimeout(resolve, 200));
              } while (scrollY !== window.scrollY);
            }
            return scroll();        
          });

          await page.waitForNetworkIdle();

          const urls = await page.evaluate((mode) => {
            function extractGroup() {
              return [...document.querySelectorAll('.photo-list-photo-container')].map(d => {
                const img = d.querySelector('img[loading]');
                const text = d.querySelector('.title');
                const user = d.querySelector('.attribution');
                return {
                  url: img.src,
                  desc: text?.textContent?.trim() || '',
                  user: user?.textContent?.trim() || '',
                  link: user?.href || '',
                };
              });
            }

            function extractAlbum() {
              return [...document.querySelectorAll('.photo-list-photo-view')].map(e => {
                 const bi = e.style.backgroundImage;
                 const url = new URL(bi.substring(5, bi.length - 2), window.location.href);
                 const text = e.querySelector('.title');
                 const user = e.querySelector('.attribution');

                 return {
                   url: url.href,
                    desc: text?.textContent?.trim() || '',
                    user: user?.textContent?.trim() || '',
                    link: user?.href || '',   };
              });
            }
            const imgs = mode === 0
               ? extractGroup()
               : extractAlbum();
            return imgs;
          }, mode);

          imgUrls.push(...urls);
          console.log('got', urls.length, 'total', imgUrls.length);

          // write each time since we might fail next
          fs.writeFileSync(path.join('lists', name), JSON.stringify(imgUrls));
          // fs.writeFileSync(path.join('lists-formatted', name), JSON.stringify(imgUrls, null, 2));

          const more = await page.evaluate(() => {
            return !!document.querySelector('a[rel=next]');
          });

          if (!more || count == 1000) {
            break;
          }

          await page.evaluate(() => {
            console.log('click next');
            document.querySelector('a[rel=next]').click();
          });
        }
      } catch (e) {
        console.error(e);
        console.error(e.stack);
      }
    }
  }

//  await extractList(groupPages, 0);
  await extractList(albums, 1);

  await browser.close();

  process.exit(0);  // eslint-disable-line
}

getImageUrls();
