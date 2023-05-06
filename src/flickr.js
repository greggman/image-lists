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

  for (const {url, js, name} of groupPages) {
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

        const urls = await page.evaluate(() => {
          const imgs = [];
          document.querySelectorAll('.photo-list-photo-container').forEach(d => {
            const img = d.querySelector('img[loading]');
            const text = d.querySelector('.title');
            const user = d.querySelector('.attribution');
            imgs.push({
              url: img.src,
              desc: text?.textContent?.trim() || '',
              user: user?.textContent?.trim() || '',
              link: user?.href || '',
            });
          });
          return imgs;
        });
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

  await browser.close();

  process.exit(0);  // eslint-disable-line
}

getImageUrls();
