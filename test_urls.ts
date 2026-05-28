import { ACCOUNTS } from "./src/data/accounts.ts";

async function checkUrls() {
  for (const account of ACCOUNTS) {
    try {
      const res = await fetch(account.sourceUrl, { method: "HEAD", redirect: "follow" });
      console.log(`[${res.status}] ${account.provider} ${account.productName} -> ${account.sourceUrl}`);
      if (res.status === 404 || res.status >= 400) {
        // Fallback to GET just in case HEAD is blocked
        const resGet = await fetch(account.sourceUrl, { method: "GET", redirect: "follow" });
        if (resGet.status === 404 || resGet.status >= 400) {
           console.log(`  -> GET also failed: ${resGet.status}`);
        } else {
           console.log(`  -> GET succeeded: ${resGet.status}`);
        }
      }
    } catch (e) {
      console.log(`[ERROR] ${account.provider} ${account.productName} -> ${account.sourceUrl} (${e.message})`);
    }
  }
}

checkUrls();
