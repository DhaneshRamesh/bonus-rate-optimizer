const fs = require('fs');

async function checkUrls() {
  const content = fs.readFileSync('./src/data/accounts.ts', 'utf-8');
  const urls = [...content.matchAll(/sourceUrl: "(https:\/\/[^"]+)"/g)].map(m => m[1]);
  
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
      console.log(`[${res.status}] ${url}`);
      if (res.status >= 400) {
        const resGet = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
        console.log(`  -> GET fallback: ${resGet.status}`);
      }
    } catch (e) {
      console.log(`[ERROR] ${url} (${e.message})`);
    }
  }
}

checkUrls();
