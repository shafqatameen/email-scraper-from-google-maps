import { chromium, Browser, Page } from "playwright";
import { isGoogleMapsUrl, sanitizeText, sleep } from "./utils";

export interface BusinessResult {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: string;
  reviews: string;
  website: string;
  category: string;
  emails: string[];
  status: "pending" | "scraped" | "error";
}

async function buildSearchUrl(query: string): Promise<string> {
  const encoded = encodeURIComponent(query);
  return `https://www.google.com/maps/search/${encoded}`;
}

async function scrollResultsPanel(page: Page): Promise<void> {
  const panel = await page.$('[role="feed"]');
  if (!panel) return;

  let lastCount = 0;
  let sameCount = 0;

  for (let i = 0; i < 15; i++) {
    await panel.evaluate((el) => el.scrollBy(0, 1200));
    await sleep(1200);

    const count = await page.$$eval(
      'a[href*="/maps/place/"]',
      (els) => els.length
    );

    if (count === lastCount) {
      sameCount++;
      if (sameCount >= 3) break;
    } else {
      sameCount = 0;
    }
    lastCount = count;
  }
}

async function extractBusinessLinks(page: Page): Promise<string[]> {
  return await page.$$eval('a[href*="/maps/place/"]', (els) =>
    [...new Set(els.map((el) => (el as HTMLAnchorElement).href))]
  );
}

async function scrapeBusinessDetail(
  page: Page,
  url: string
): Promise<Partial<BusinessResult>> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    await sleep(1500);

    const name = await page
      .$eval('h1[class*="fontHeadlineLarge"]', (el) =>
        el.textContent?.trim() || ""
      )
      .catch(() => "");

    const address = await page
      .$eval('[data-item-id="address"] .fontBodyMedium', (el) =>
        el.textContent?.trim() || ""
      )
      .catch(() => "");

    const phone = await page
      .$eval('[data-item-id*="phone"] .fontBodyMedium', (el) =>
        el.textContent?.trim() || ""
      )
      .catch(() => "");

    const rating = await page
      .$eval('div[jslog*="rating"] span[aria-hidden="true"]', (el) =>
        el.textContent?.trim() || ""
      )
      .catch(() => "");

    const reviews = await page
      .$eval('button[jsaction*="reviewChart"] span', (el) =>
        el.textContent?.replace(/[()]/g, "").trim() || ""
      )
      .catch(() => "");

    const website = await page
      .$eval('a[data-item-id="authority"]', (el) =>
        (el as HTMLAnchorElement).href || ""
      )
      .catch(() => "");

    const category = await page
      .$eval('button[jsaction*="category"]', (el) =>
        el.textContent?.trim() || ""
      )
      .catch(() => "");

    return {
      name: sanitizeText(name),
      address: sanitizeText(address),
      phone: sanitizeText(phone),
      rating,
      reviews,
      website,
      category: sanitizeText(category),
    };
  } catch {
    return {};
  }
}

export async function* scrapeGoogleMaps(
  input: string,
  limit: number = 20
): AsyncGenerator<BusinessResult> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        "--window-size=1280,900",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 900 },
      locale: "en-US",
    });

    const page = await context.newPage();

    // Navigate to Maps
    const url = isGoogleMapsUrl(input) ? input : await buildSearchUrl(input);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(2000);

    // Dismiss cookie consent if present
    await page
      .click('button[aria-label*="Accept"]', { timeout: 3000 })
      .catch(() => {});
    await sleep(500);

    // Scroll to load more results
    await scrollResultsPanel(page);

    // Get all business links
    const links = (await extractBusinessLinks(page)).slice(0, limit);

    // Open detail page in new tab for each business
    let index = 0;
    for (const link of links) {
      const detailPage = await context.newPage();
      const detail = await scrapeBusinessDetail(detailPage, link);
      await detailPage.close();

      const result: BusinessResult = {
        id: `${Date.now()}-${index++}`,
        name: detail.name || "Unknown",
        address: detail.address || "",
        phone: detail.phone || "",
        rating: detail.rating || "",
        reviews: detail.reviews || "",
        website: detail.website || "",
        category: detail.category || "",
        emails: [],
        status: "scraped",
      };

      yield result;
      await sleep(500);
    }
  } finally {
    if (browser) await browser.close();
  }
}
