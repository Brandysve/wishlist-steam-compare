"use client";

import { useMemo, useState } from "react";
import type { OfferComparisonResult } from "@/lib/offers/build-offer-comparison";

type Filter = "all" | "interesting" | "unmatched";
type Sort = "discount" | "price" | "name";

interface ComparisonResultsProps {
  results: OfferComparisonResult[];
  isDemo: boolean;
}

function formatPrice(value: number | null, currency = "EUR") {
  if (value === null) return "Indisponible";
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency,
  }).format(value);
}

export function ComparisonResults({ results, isDemo }: ComparisonResultsProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("discount");

  const visibleResults = useMemo(() => {
    const filtered = results.filter((result) => {
      if (filter === "interesting") return result.bestOffer?.isInteresting ?? false;
      if (filter === "unmatched") return !result.bestOffer;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.game.name.localeCompare(b.game.name, "fr");
      if (sort === "price") {
        return (a.bestOffer?.offer.price ?? Number.POSITIVE_INFINITY) -
          (b.bestOffer?.offer.price ?? Number.POSITIVE_INFINITY);
      }
      return (b.bestOffer?.savingsPercent ?? -1) - (a.bestOffer?.savingsPercent ?? -1);
    });
  }, [filter, results, sort]);

  if (results.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="comparison-title">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="comparison-title" className="text-2xl font-bold text-white">
              Comparaison
            </h2>
            {isDemo ? (
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
                Données de démonstration
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {results.length} jeu{results.length > 1 ? "x" : ""} analysé{results.length > 1 ? "s" : ""}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            Filtrer
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as Filter)}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
            >
              <option value="all">Toutes</option>
              <option value="interesting">Intéressantes</option>
              <option value="unmatched">Sans offre</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            Trier
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
            >
              <option value="discount">Meilleure réduction</option>
              <option value="price">Prix le plus bas</option>
              <option value="name">Nom</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {visibleResults.map(({ game, bestOffer }) => (
          <article
            key={game.appId}
            className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/10 sm:grid sm:grid-cols-[220px_1fr]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={game.capsuleUrl} alt="" className="h-full min-h-28 w-full object-cover" />
            <div className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Steam : {formatPrice(game.currentPrice, game.currency ?? "EUR")}
                  </p>
                </div>
                {bestOffer?.isInteresting ? (
                  <span className="self-start rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Offre intéressante
                  </span>
                ) : null}
              </div>

              {bestOffer ? (
                <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-slate-950/55 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                      {bestOffer.offer.providerName}
                    </p>
                    <p className="mt-1 font-medium text-white">{bestOffer.offer.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {bestOffer.offer.editionLabel ?? "Édition standard"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 md:text-right">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(bestOffer.offer.price, bestOffer.offer.currency)}
                      </p>
                      {bestOffer.savingsPercent !== null ? (
                        <p className="text-sm font-semibold text-emerald-300">
                          −{bestOffer.savingsPercent}%
                        </p>
                      ) : null}
                    </div>
                    <a
                      href={bestOffer.offer.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                    >
                      Voir l’offre
                    </a>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                  Aucune offre admissible trouvée.
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {visibleResults.length === 0 ? (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-center text-slate-400">
          Aucun résultat ne correspond à ce filtre.
        </p>
      ) : null}
    </section>
  );
}
