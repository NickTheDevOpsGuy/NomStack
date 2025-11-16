import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { DishResult } from "@/components/DishResult/DishResult";
import { Loading, Empty, ErrorMessage } from "@/components/StateDisplay";
import { useDishLookup } from "@hooks/useDishLookup";
import { useLocalStorage } from "@hooks/useLocalStorage";

export default function App() {
  const { query, setQuery, status, data, error } = useDishLookup("");

  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");

  // persisted local data
  const [recent, setRecent] = useLocalStorage<string[]>("recent-words", []);
  const [favs, setFavs] = useLocalStorage<string[]>("fav-words", []);

  // read ?q=term on load
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("q") ?? "";
    const q = raw.trim().slice(0, 64);
    if (q) {
      setQuery(q);
      setName(q); // prefill main input from URL if present
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep URL in sync
  const pushQueryToUrl = (term: string) => {
    const params = new URLSearchParams(window.location.search);
    if (term) params.set("q", term);
    else params.delete("q");
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const handleSubmit = (nameInput: string, proteinInput: string) => {
    const combined = [nameInput.trim(), proteinInput.trim()]
      .filter(Boolean)
      .join(" ");

    const next = combined.slice(0, 64);
    if (!next) return;

    setQuery(next);
    pushQueryToUrl(next);

    setRecent((r) =>
      [next, ...r.filter((w) => w.toLowerCase() !== next.toLowerCase())].slice(
        0,
        5,
      ),
    );

    // clear both text fields after submit
    setName("");
    setProtein("");
  };

  // Esc key to clear query + inputs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        pushQueryToUrl("");
        setName("");
        setProtein("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setQuery]);

  // favorites helpers
  const isFav = useMemo(
    () =>
      !!data?.name &&
      favs.some((w) => w.toLowerCase() === data.name.toLowerCase()),
    [favs, data?.name],
  );

  const toggleFav = () => {
    if (!data?.name) return;
    const w = data.name.trim();
    setFavs((list) =>
      list.some((x) => x.toLowerCase() === w.toLowerCase())
        ? list.filter((x) => x.toLowerCase() !== w.toLowerCase())
        : [w, ...list],
    );
  };

  const removeFav = (w: string) => {
    setFavs((list) => list.filter((x) => x.toLowerCase() !== w.toLowerCase()));
  };

  // retry on error
  const retry = () => {
    if (!query.trim()) return;
    handleSubmit(query, "");
  };

  // wipe all local state
  const clearAllLocal = () => {
    if (!confirm("Clear recent searches, favorites, and the current query?"))
      return;
    try {
      localStorage.removeItem("recent-words");
      localStorage.removeItem("fav-words");
    } catch {
      // ignore
    }
    setRecent([]);
    setFavs([]);
    setQuery("");
    pushQueryToUrl("");
    setName("");
    setProtein("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950 dark:text-slate-100">
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="bg-gradient-to-r from-sky-500 via-indigo-500 to-slate-700 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
            Nom Stack
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Type a dish and press{" "}
            <kbd className="rounded bg-sky-100 px-1 py-0.5 font-mono text-xs text-slate-800 dark:bg-sky-900/60 dark:text-sky-100">
              Enter
            </kbd>
            .
          </p>
        </header>

        {/* Search + controls */}
        <section className="space-y-3 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm dark:border-sky-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <SearchBar
                value={name}
                onChange={setName}
                proteinValue={protein}
                onProteinChange={setProtein}
                onSubmit={handleSubmit}
              />
            </div>
          </div>

          {recent.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {recent.map((w) => (
                <button
                  key={w}
                  className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sm text-slate-800 hover:bg-sky-100 dark:border-sky-600 dark:bg-slate-800 dark:text-sky-100 dark:hover:bg-slate-700"
                  onClick={() => handleSubmit(w, "")}
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Favorites */}
        {favs.length > 0 && (
          <section className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm dark:border-sky-700 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-800 dark:text-sky-100">
                Saved dishes
              </h2>
              <button
                className="text-xs text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
                onClick={() => setFavs([])}
              >
                Clear favorites
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {favs.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sm dark:border-sky-600 dark:bg-slate-800"
                >
                  <button
                    className="hover:underline"
                    onClick={() => handleSubmit(w, "")}
                    aria-label={`Search ${w}`}
                  >
                    ★ {w}
                  </button>
                  <button
                    className="text-slate-600 hover:text-slate-900 dark:text-sky-300 dark:hover:text-sky-100"
                    aria-label={`Remove ${w}`}
                    onClick={() => removeFav(w)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* States */}
        {status === "idle" && <Empty />}
        {status === "loading" && <Loading />}

        {status === "error" && (
          <div className="space-y-2 rounded-xl border border-red-300/60 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
            <ErrorMessage message={error ?? "Something went wrong"} />
            <button
              onClick={retry}
              className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-slate-800 hover:bg-sky-100 dark:border-sky-600 dark:bg-slate-800 dark:text-sky-100 dark:hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        )}

        {status === "success" && data && (
          <>
            <div className="flex justify-end">
              <button
                aria-label={
                  isFav ? "Remove from favorites" : "Save to favorites"
                }
                onClick={toggleFav}
                className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-sm text-slate-800 hover:bg-sky-100 dark:border-sky-600 dark:bg-slate-800 dark:text-sky-100 dark:hover:bg-slate-700"
              >
                {isFav ? "★ Saved" : "☆ Save"}
              </button>
            </div>

            {data.name?.length ? (
              <DishResult data={data} term={query} />
            ) : (
              <div className="rounded-xl border border-sky-200 bg-white p-4 dark:border-sky-700 dark:bg-slate-900">
                <p className="text-sm text-slate-800 dark:text-sky-100">
                  No definitions found for that dish.
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="flex justify-center pt-2">
          <button
            onClick={clearAllLocal}
            className="text-xs text-sky-700 underline hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
          >
            Clear all local data
          </button>
        </div>
      </main>
    </div>
  );
}
