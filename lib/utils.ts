export function normalizeUrl(url: string): string {
  if (!url) return "";
  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isGoogleMapsUrl(url: string): boolean {
  return url.includes("google.com/maps") || url.includes("maps.google");
}

export function sanitizeText(text: string): string {
  // Replace newlines and tabs with space, remove PUA Unicode icons (Google Maps uses these), and trim
  return text
    .replace(/[\uE000-\uF8FF]/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function deduplicateEmails(emails: string[]): string[] {
  return [...new Set(emails.map((e) => e.toLowerCase().trim()))].filter(Boolean);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
