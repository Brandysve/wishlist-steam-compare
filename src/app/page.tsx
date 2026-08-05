import { WishlistSearchForm } from "@/components/wishlist-search-form";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16 sm:px-10 lg:py-24">
      <header className="mb-16 flex items-center justify-between gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
          Wishlist Steam Compare
        </p>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          MVP
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
        <WishlistSearchForm />
      </section>
    </main>
  );
}
