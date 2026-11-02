// IndexNow (Bing, Yandex, Seznam, Naver): after each daily release, scripts/indexnow-submit.ts sends the sitemap's
// URLs so those engines recrawl now. Bing's index also feeds ChatGPT and Copilot search. Google does not take
// IndexNow; it reads the sitemap through Search Console.
//
// The key is public by design (IndexNow fetches it from the site to prove ownership), so it is committed: the file
// public/<INDEXNOW_KEY>.txt holds exactly the key, served as a static file (no function, no secret, no Bill step).
export const INDEXNOW_KEY = "929e5099e01a6236ab68556297d6ddf5";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
/** IndexNow takes at most 10,000 URLs per request. */
export const INDEXNOW_MAX_URLS = 10_000;

/** One request body per 10,000 of the site's own URLs (the sitemap holds about 14,000). */
export function indexNowBodies(siteUrl: string, urls: string[]) {
  const host = new URL(siteUrl).host;
  const own = [...new Set(urls)].filter((u) => {
    try {
      return new URL(u).host === host;
    } catch {
      return false;
    }
  });
  const bodies = [];
  for (let i = 0; i < own.length; i += INDEXNOW_MAX_URLS) {
    bodies.push({ host, key: INDEXNOW_KEY, keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`, urlList: own.slice(i, i + INDEXNOW_MAX_URLS) });
  }
  return bodies;
}
