"use client";

import { FormEvent, useEffect, useState } from "react";
import { parseSteamWishlistInput } from "@/lib/steam/parse-wishlist-input";

const STORAGE_KEY = "wishlist-steam-compare:last-wishlist";

export function WishlistSearchForm() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(STORAGE_KEY);
    if (savedValue) setValue(savedValue);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const wishlist = parseSteamWishlistInput(value);
    if (!wishlist) {
      setError("Saisissez une URL de wishlist Steam publique, un SteamID64 ou un identifiant personnalisé valide.");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, wishlist.canonicalUrl);
    setValue(wishlist.canonicalUrl);
    setError(null);
  }

  return (
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
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder="URL de wishlist, SteamID64 ou identifiant Steam"
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "wishlist-error" : "wishlist-help"}
          className="min-h-12 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-4 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
        />
        <button
          type="submit"
          className="min-h-12 rounded-lg bg-sky-500 px-6 font-semibold text-slate-950 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Comparer
        </button>
      </div>

      {error ? (
        <p id="wishlist-error" role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      ) : (
        <p id="wishlist-help" className="text-sm text-slate-400">
          La wishlist doit être publique. La dernière adresse valide reste mémorisée uniquement dans ce navigateur.
        </p>
      )}
    </form>
  );
}
