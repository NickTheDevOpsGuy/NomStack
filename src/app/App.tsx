import { useEffect, useMemo, useState } from 'react';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { DishResult } from '@/components/DishResult/DishResult';
import { Loading, Empty, ErrorMessage } from '@/components/StateDisplay';
import { useDishLookup } from '@hooks/useDishLookup';
import { useLocalStorage } from '@hooks/useLocalStorage';

export default function App() {
  // Active query that drives the API / lookup:
  const { query, setQuery, status, data, error } = useDishLookup('');

  // Form inputs are independent from the active query:
  const [nameInput, setNameInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');

  // persisted local data
  const [recent, setRecent] = useLocalStorage<string[]>('recent-words', []);
  const [favs, setFavs] = useLocalStorage<string[]>('fav-words', []);

  // read ?q=term on load
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('q') ?? '';
    const q = raw.trim().slice(0, 64);
    if (q) {
      setQuery(q);
      setNameInput(q); // show initial query in the top input
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep URL in sync with the ACTIVE query only
  const pushQueryToUrl = (term: string) => {
    const params = new URLSearchParams(window.location.search);
    if (term) params.set('q', term);
    else params.delete('q');

    const qs = params.toString();
    const base = window.location.pathname;
    window.history.replaceState(null, '', qs ? `${base}?${qs}` : base);
  };

  // Called when SearchBar submits (from either field)
  const handleSubmit = (name: string, protein: string) => {
    const trimmedName = name.trim().slice(0, 64);
    const trimmedProtein = protein.trim().slice(0, 64);

    // Prefer dish name; fall back to protein if name is empty
    const primary = trimmedName || trimmedProtein;
    if (!primary) return;

    // update active query (drives lookup hook)
    setQuery(primary);
    pushQueryToUrl(primary);

    // update recents by what we actually searched for
    setRecent((r) =>
      [
        primary,
        ...r.filter((w) => w.toLowerCase() !== primary.toLowerCase()),
      ].slice(0, 5)
    );
    // NOTE: we do NOT change nameInput/proteinInput here.
    // They stay whatever the user typed.
  };

  // Esc key to clear BOTH inputs and the active query
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNameInput('');
        setProteinInput('');
        setQuery('');
        pushQueryToUrl('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setQuery]);

  // favorites helpers
  const isFav = useMemo(
    () =>
      !!data?.name &&
      favs.some((w) => w.toLowerCase() === data.name.toLowerCase()),
    [favs, data?.name]
  );

  const toggleFav = () => {
    if (!data?.name) return;
    const w = data.name.trim();
    setFavs((list) =>
      list.some((x) => x.toLowerCase() === w.toLowerCase())
        ? list.filter((x) => x.toLowerCase() !== w.toLowerCase())
        : [w, ...list]
    );
  };

  const removeFav = (w: string) => {
    setFavs((list) => list.filter((x) => x.toLowerCase() !== w.toLowerCase()));
  };

  // retry on error
  const retry = () => {
    const last = query.trim();
    if (!last) return;
    // just re-run the last active query
    setQuery(last);
    pushQueryToUrl(last);
  };

  // wipe all local state
  const clearAllLocal = () => {
    if (!confirm('Clear recent searches, favorites, and the current query?'))
      return;
    try {
      localStorage.removeItem('recent-words');
      localStorage.removeItem('fav-words');
    } catch {
      // ignore
    }
    setRecent([]);
    setFavs([]);
    setNameInput('');
    setProteinInput('');
    setQuery('');
    pushQueryToUrl('');
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900 dark:from-zinc-950 dark:to-zinc-900 dark:text-zinc-100'>
      <main className='mx-auto max-w-2xl space-y-6 px-4 py-8'>
        {/* Header */}
        <header className='space-y-1'>
          <h1 className='bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent'>
            Nom Stack
          </h1>
          <p className='text-sm text-zinc-600 dark:text-zinc-400'>
            Type a dish or protein and press{' '}
            <kbd className='rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-800'>
              Enter
            </kbd>
            .
          </p>
        </header>

        {/* Search + controls */}
        <section className='space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex-1'>
              <SearchBar
                value={nameInput}
                proteinValue={proteinInput}
                onChange={setNameInput}
                onProteinChange={setProteinInput}
                onSubmit={handleSubmit}
              />
            </div>
          </div>

          {recent.length > 0 && (
            <div className='flex flex-wrap gap-2 pt-1'>
              {recent.map((w) => (
                <button
                  key={w}
                  className='rounded-full border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                  onClick={() => {
                    // clicking a chip fills the top input AND runs the search
                    setNameInput(w);
                    handleSubmit(w, proteinInput);
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Favorites */}
        {favs.length > 0 && (
          <section className='rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900'>
            <div className='mb-2 flex items-center justify-between'>
              <h2 className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                Saved words
              </h2>
              <button
                className='text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                onClick={() => setFavs([])}
              >
                Clear favorites
              </button>
            </div>

            <div className='flex flex-wrap gap-2'>
              {favs.map((w) => (
                <span
                  key={w}
                  className='inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-sm dark:border-amber-800 dark:bg-amber-900/30'
                >
                  <button
                    className='hover:underline'
                    onClick={() => {
                      setNameInput(w);
                      handleSubmit(w, proteinInput);
                    }}
                    aria-label={`Search ${w}`}
                  >
                    ★ {w}
                  </button>
                  <button
                    className='text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    aria-label={`Remove ${w} from favorites`}
                    onClick={() => removeFav(w)}
                    title='Remove'
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* States */}
        {status === 'idle' && <Empty />}
        {status === 'loading' && <Loading />}
        {status === 'error' && (
          <div className='space-y-2 rounded-xl border border-red-300/50 bg-red-50 p-4 dark:bg-red-900/20'>
            <ErrorMessage message={error ?? 'Something went wrong'} />
            <button
              onClick={retry}
              className='rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
            >
              Retry
            </button>
          </div>
        )}

        {status === 'success' && data && (
          <>
            <div className='flex justify-end'>
              <button
                aria-label={
                  isFav ? 'Remove from favorites' : 'Save to favorites'
                }
                onClick={toggleFav}
                className='rounded border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
              >
                {isFav ? '★ Saved' : '☆ Save'}
              </button>
            </div>

            {data.name?.length ? (
              <DishResult data={data} term={query} />
            ) : (
              <div className='rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900'>
                <p className='text-sm text-zinc-700 dark:text-zinc-300'>
                  No definitions found for that dish.
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className='flex justify-center pt-2'>
          <button
            onClick={clearAllLocal}
            className='text-xs text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200'
          >
            Clear all local data
          </button>
        </div>
      </main>
    </div>
  );
}
