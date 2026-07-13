import * as cheerio from "cheerio";
import { deduplicateEmails, isValidUrl, normalizeUrl } from "./utils";

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const BLOCKED_EMAIL_DOMAINS = [
  "example.com",
  "domain.com",
  "yourdomain.com",
  "email.com",
  "sentry.io",
  "wixpress.com",
  "squarespace.com",
  "githubusercontent.com",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
];

const CONTACT_PATHS = [
  "/contact",
  "/contact-us",
  "/about",
  "/about-us",
  "/reach-us",
  "/get-in-touch",
  "/connect",
  "/info",
];

function filterEmails(emails: string[]): string[] {
  return emails.filter((email) => {
    const domain = email.split("@")[1]?.toLowerCase() || "";
    return !BLOCKED_EMAIL_DOMAINS.some((blocked) => domain.includes(blocked));
  });
}

async function fetchHtml(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

function extractEmailsFromHtml(html: string): string[] {
  if (!html) return [];
  const $ = cheerio.load(html);
  // Remove script/style noise
  $("script, style, noscript").remove();
  const text = $.html();
  const matches = text.match(EMAIL_REGEX) || [];
  return filterEmails(matches);
}

export async function extractEmails(websiteUrl: string): Promise<string[]> {
  if (!websiteUrl || !isValidUrl(websiteUrl)) return [];

  const baseUrl = normalizeUrl(websiteUrl);
  const allEmails: string[] = [];

  // 1. Scrape homepage
  const homeHtml = await fetchHtml(baseUrl);
  allEmails.push(...extractEmailsFromHtml(homeHtml));

  // 2. If no emails found, try contact pages
  if (allEmails.length === 0) {
    for (const path of CONTACT_PATHS) {
      const contactUrl = baseUrl + path;
      const contactHtml = await fetchHtml(contactUrl);
      const found = extractEmailsFromHtml(contactHtml);
      if (found.length > 0) {
        allEmails.push(...found);
        break;
      }
    }
  }

  return deduplicateEmails(allEmails).slice(0, 5); // max 5 emails per business
}
