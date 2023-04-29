import {JSDOM} from 'jsdom';
import feeds from './feeds.js';

class DOMParser {
  parseFromString(s, contentType = 'text/html') {
    return new JSDOM(s, {contentType}).window.document;
  }
}

/*
<entry>
    <title>Dilapidation, Essex, VT</title>
    <link rel="alternate" type="text/html" href="https://www.flickr.com/photos/195136680@N07/52843646233/in/pool-2471767@N21"/>
    <id>tag:flickr.com,2005:/grouppool/2471767@N21/photo/52843646233</id>
    <published>2023-04-24T18:35:12Z</published>
    <updated>2023-04-24T18:35:12Z</updated>
    <flickr:date_taken>2023-04-01T14:41:23-08:00</flickr:date_taken>
    <dc:date.Taken>2023-04-01T14:41:23-08:00</dc:date.Taken>
    <content type="html">&lt;p&gt;&lt;a href=&quot;https://www.flickr.com/people/195136680@N07/&quot;&gt;R. Braley&lt;/a&gt; has added a photo to the pool:&lt;/p&gt;
&lt;p&gt;&lt;a href=&quot;https://www.flickr.com/photos/195136680@N07/52843646233/&quot; title=&quot;Dilapidation, Essex, VT&quot;&gt;&lt;img src=&quot;https://live.staticflickr.com/65535/52843646233_37f7c1a4ea_m.jpg&quot; width=&quot;240&quot; height=&quot;160&quot; alt=&quot;Dilapidation, Essex, VT&quot; /&gt;&lt;/a&gt;&lt;/p&gt;
</content>
    <author>
      <name>R. Braley</name>
      <uri>https://www.flickr.com/people/195136680@N07/</uri>
      <flickr:nsid>195136680@N07</flickr:nsid>
    </author>
    <link rel="enclosure" type="image/jpeg" href="https://live.staticflickr.com/65535/52843646233_37f7c1a4ea_b.jpg" />
    <category term="essexjunction" scheme="https://www.flickr.com/photos/tags/" />
    <category term="vermont" scheme="https://www.flickr.com/photos/tags/" />
    <category term="unitedstates" scheme="https://www.flickr.com/photos/tags/" />
</entry>
*/

function getText(entry, tag) {
  const elem = entry.querySelector(tag);
  return elem ? elem.textContent : '';
}

function getImage(entry) {
  const image = entry.querySelector('link[type$=jpeg]');
  return image?.getAttribute('href');
}

function getTags(entry) {
  return [...entry.querySelectorAll('category[term]')].map(e => e.getAttribute('term')).filter(v => !!v);
}

async function getImages(feed) {
  const res = await fetch(feed);
  const text = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'application/xml');
  const entries = [...xml.querySelectorAll('entry')];
  const images = [];
  entries.forEach(entry => {
    const image = getImage(entry);
    if (image) {
      images.push({
        image,
        title: getText(entry, 'title'),
        date: getText(entry, 'updated') || getText(entry, 'published'),
        author: {
          name: getText(entry, 'name'),
          link: getText(entry, 'uri'),
        },
        tags: getTags(entry)
      });
    }
  });
  return images;
}

async function main() {
  for (const feed of feeds) {
    try {
    const images = await getImages(feed)
      console.log(JSON.stringify(images, null, 2));
    } catch (e) {
      console.error(e);
    }
  }


}

main();
