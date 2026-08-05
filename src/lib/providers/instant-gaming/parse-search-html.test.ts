import { describe, expect, it } from "vitest";
import { parseInstantGamingSearchHtml } from "@/lib/providers/instant-gaming/parse-search-html";

describe("parseInstantGamingSearchHtml", () => {
  it("extracts euro-priced product cards", () => {
    const html = `
      <article class="item force-badge" data-product-id="1234">
        <a href="/fr/1234-acheter-resident-evil-4-deluxe-pc-steam/" title="Resident Evil 4 Deluxe Edition - PC (Steam)">
          <span class="name">Resident Evil 4 Deluxe Edition - PC (Steam)</span>
          <span class="price">24,99 €</span>
        </a>
      </article>
    `;

    expect(parseInstantGamingSearchHtml(html)).toEqual([
      expect.objectContaining({
        externalId: "1234",
        title: "Resident Evil 4 Deluxe Edition - PC (Steam)",
        price: 24.99,
        currency: "EUR",
        platform: "Steam PC",
      }),
    ]);
  });

  it("ignores cards without an identifiable euro price", () => {
    const html = `
      <article class="item force-badge">
        <a href="/fr/9999-test/"><span class="name">Test Game</span><span class="price">$19.99</span></a>
      </article>
    `;

    expect(parseInstantGamingSearchHtml(html)).toEqual([]);
  });
});
