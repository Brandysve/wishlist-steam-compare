import Image from "next/image";
import type { SteamGame } from "@/types/steam";

function formatPrice(price: number | null, currency: string | null) {
  if (price == null) return "Prix indisponible";
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: currency ?? "EUR",
  }).format(price);
}

export function SteamGameList({ games }: { games: SteamGame[] }) {
  if (games.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 text-slate-300">
        Aucun jeu n’a été trouvé dans cette wishlist.
      </p>
    );
  }

  return (
    <section className="mt-10" aria-labelledby="wishlist-results-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-sky-300">Wishlist chargée</p>
          <h2 id="wishlist-results-title" className="text-2xl font-bold text-white">
            {games.length} jeu{games.length > 1 ? "x" : ""}
          </h2>
        </div>
        <p className="text-sm text-slate-400">Prix Steam Belgique</p>
      </div>

      <div className="grid gap-4">
        {games.map((game) => (
          <article
            key={game.appId}
            className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/10 sm:grid sm:grid-cols-[230px_1fr]"
          >
            <div className="relative aspect-[460/215] bg-slate-950 sm:aspect-auto sm:min-h-28">
              <Image
                src={game.capsuleUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 230px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                <p className="mt-1 text-sm text-slate-400">App {game.appId}</p>
              </div>
              <div className="flex items-center justify-between gap-5 sm:justify-end">
                <div className="text-right">
                  {game.discountPercent > 0 && game.normalPrice != null ? (
                    <p className="text-sm text-slate-500 line-through">
                      {formatPrice(game.normalPrice, game.currency)}
                    </p>
                  ) : null}
                  <p className="text-lg font-bold text-white">
                    {formatPrice(game.currentPrice, game.currency)}
                  </p>
                  {game.discountPercent > 0 ? (
                    <p className="text-sm font-semibold text-lime-300">-{game.discountPercent}%</p>
                  ) : null}
                </div>
                <a
                  href={game.steamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Steam
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
