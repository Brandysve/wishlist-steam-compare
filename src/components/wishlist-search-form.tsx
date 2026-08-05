"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ComparisonResults } from "@/components/comparison-results";
import { buildOfferComparison, type OfferComparisonResult } from "@/lib/offers/build-offer-comparison";
import { getActiveProviders } from "@/lib/providers/get-active-providers";
import { parseSteamWishlistInput } from "@/lib/steam/parse-wishlist-input";
import type { SteamWishlistResponse } from "@/types/steam";

const STORAGE_KEY = "wishlist-steam-compare:last-wishlist";
const MAX_CONCURRENT_SEARCHES = 4;

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let cursor = 0;

  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await mapper(values[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => worker()),
  );
  return results;
}

export function WishlistSearchForm() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<OfferComparisonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const activeProviders = useMemo(() => getActiveProviders(), []);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(STORAGE_KEY);
    if (savedValue) setValue(savedValue);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const wishlist = parseSteamWishlistInput(value);
    if (!wishlist) {
      setError("Saisissez une URL de wishlist Steam publique, un SteamID64 ou un identifiant personnalisé valide.");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, wishlist.canonicalUrl);
    setValue(wishlist.canonicalUrl);
    setError(null);
    setResults([]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/steam/wishlist?wishlist=${encodeURIComponent(wishlist.canonicalUrl)}`,
      );
      const data = (await response.json()) as SteamWishlistResponse & { error?: string };

      if (!response.ok) throw new Error(data.error ?? "La wishlist n’a pas pu être chargée.");

      const comparisons = await mapWithConcurrency(
        data.games,
        MAX_CONCURRENT_SEARCHES,
        (game) => buildOfferComparison(game, activeProviders.providers),
      );
      setResults(comparisons);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "La wishlist n’a pas pu être chargée.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="wishlist-url" className="sr-only">
            URL ou identifiant de la wishlist Steam
          </label>
          <input
            id="wishlist-url"
            name="wishlist-url"
            type="text"
            value={value}
            disabled={isLoading}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            placeholder="URL de wishlist, SteamID64 ou identifiant Steam"
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "wishlist-error" : "wishlist-help"}
            className="min-h-12 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-4 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="min-h-12 rounded-lg bg-sky-500 px-6 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? "Analyse…" : "Comparer"}
          </button>
        </div>

        {error ? (
          <p id="wishlist-error" role="alert" className="text-sm text-rose-300">
            {error}
          </p>
        ) : (
          <p id="wishlist-help" className="text-sm text-slate-400">
            La wishlist doit être publique. Les prix Instant Gaming sont récupérés au moment de la comparaison.
          </p>
        )}
      </form>

      {!activeProviders.hasRealProvider && results.length > 0 ? (
        <p className="mt-6 rounded-xl border border-sky-300/20 bg-sky-300/10 p-4 text-sm text-sky-100">
          Les jeux Steam sont chargés, mais aucun fournisseur de prix réel n’est connecté.
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 text-slate-300" role="status">
          Récupération de la wishlist et recherche des prix Instant Gaming…
        </div>
      ) : (
        <ComparisonResults results={results} isDemo={activeProviders.isDemo} />
      )}
    </>
  );
}
