export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16 sm:px-10 lg:py-24">
      <header className="mb-16 flex items-center justify-between gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
          Wishlist Steam Compare
        </p>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          MVP en préparation
        </span>
      </header>

      <section className="max-w-3xl">
        <p className="mb-4 text-sm font-medium text-sky-300">
          Comparez avant d’acheter
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Trouvez la meilleure offre pour les jeux de votre wishlist Steam.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Collez l’adresse d’une wishlist publique. Le service comparera les prix
          Steam avec Instant Gaming et mettra en avant les offres réellement
          intéressantes.
        </p>
      </section>

      <section className="mt-12 rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
        <form className="flex flex-col gap-3 sm:flex-row" aria-label="Comparer une wishlist Steam">
          <label htmlFor="wishlist-url" className="sr-only">
            URL de la wishlist Steam
          </label>
          <input
            id="wishlist-url"
            name="wishlist-url"
            type="url"
            disabled
            placeholder="https://store.steampowered.com/wishlist/..."
            className="min-h-12 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-4 text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled
            className="min-h-12 rounded-lg bg-sky-500 px-6 font-semibold text-slate-950 opacity-70 disabled:cursor-not-allowed"
          >
            Comparer
          </button>
        </form>
        <p className="mt-3 text-sm text-slate-400">
          La recherche sera activée lors du prochain sprint.
        </p>
      </section>
    </main>
  );
}
