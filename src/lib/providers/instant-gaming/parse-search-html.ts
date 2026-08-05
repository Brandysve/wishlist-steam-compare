import * as cheerio from "cheerio";
import type { RawPriceOffer } from "@/types/offers";

const BASE_URL = "https://www.instant-gaming.com";

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseEuroPrice(value: string): number | null {
  const match = value
    .replace(/\u00a0/g, " ")
    .match(/(\d{1,4}(?:[.,]\d{1,2})?)\s*€/);
  if (!match) return null;
  const parsed = Number(match[1].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function absoluteUrl(value: string) {
  try {
    return new URL(value, BASE_URL).toString();
  } catch {
    return "";
  }
}

export function parseInstantGamingSearchHtml(html: string): RawPriceOffer[] {
  const $ = cheerio.load(html);
  const offers: RawPriceOffer[] = [];
  const seen = new Set<string>();

  const candidates = $(
    "article.item, article.force-badge, .item.force-badge, [data-product-id]",
  );

  candidates.each((_, element) => {
    const node = $(element);
    const link = node.find("a[href]").first();
    const href = absoluteUrl(link.attr("href") ?? "");
    if (!href || !href.includes("instant-gaming.com")) return;

    const title = normalizeText(
      node
        .find(".name, .title, .product-title, [itemprop='name']")
        .first()
        .text() || link.attr("title") || link.text(),
    );
    if (!title) return;

    const priceText = normalizeText(
      node
        .find(".price, .current-price, [itemprop='price']")
        .first()
        .text() || node.text(),
    );
    const price = parseEuroPrice(priceText);
    if (price === null) return;

    const dedupeKey = `${href}|${price}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);

    const externalId =
      node.attr("data-product-id") ??
      href.match(/\/([0-9]+)-[^/]+\/?$/)?.[1] ??
      dedupeKey;

    offers.push({
      providerId: "instant-gaming",
      providerName: "Instant Gaming",
      externalId,
      title,
      url: href,
      price,
      currency: "EUR",
      platform: /\bsteam\b/i.test(title) ? "Steam PC" : null,
      region: /\beurope\b|\beu\b/i.test(title) ? "Europe" : null,
      inStock: !/rupture|indisponible|out of stock/i.test(node.text()),
    });
  });

  return offers;
}
