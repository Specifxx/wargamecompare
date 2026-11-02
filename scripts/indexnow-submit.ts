// Sends every sitemap URL to IndexNow after the daily release (refresh-prices.yml). See src/lib/indexnow.ts.
// A refusal is logged, never fatal: the data commit has already landed and the sitemap still works.
import sitemap from "@/app/sitemap";
import { INDEXNOW_ENDPOINT, indexNowBodies } from "@/lib/indexnow";
import { SITE_URL } from "@/lib/site";

async function main() {
  for (const body of indexNowBodies(SITE_URL, sitemap().map((e) => e.url))) {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    const text = res.ok ? "" : ` ${(await res.text()).slice(0, 300)}`;
    console.log(`[indexnow] ${res.status} for ${body.urlList.length} URLs on ${body.host}${text}`);
  }
}

main().catch((e) => console.log(`[indexnow] failed: ${e instanceof Error ? e.message : e}`));
