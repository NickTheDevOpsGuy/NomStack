import { useEffect, useMemo } from 'react';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { DishResult } from '@/components/DishResult/DishResult';
import { Loading, Empty, ErrorMessage } from '@/components/StateDisplay';
import { useDishLookup } from '@hooks/useDishLookup';
import { useLocalStorage } from '@hooks/useLocalStorage';
import type { DishVariant, DishEntry } from '@/types/dish.types';

export default function App() {
  const { query, setQuery, status, data, error } = useDishLookup('');

  // persisted local data
  const [recent, setRecent] = useLocalStorage<string[]>('recent-words', []);
  const [favs, setFavs] = useLocalStorage<string[]>('fav-words', []);

  // read ?q=term on load
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('q') ?? '';
    const q = raw.trim().slice(0, 64);
    if (q) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep URL in sync
  const pushQueryToUrl = (term: string) => {
    const params = new URLSearchParams(window.location.search);
    if (term) params.set('q', term);
    else params.delete('q');
    window.history.replaceState(null, '', `?${params.toString()}`);
  };

  const handleSubmit = (term: string) => {
    const next = term.trim().slice(0, 64);
    if (!next) return;

    setQuery(next);
    pushQueryToUrl(next);

    setRecent((r) =>
      [next, ...r.filter((w) => w.toLowerCase() !== next.toLowerCase())].slice(
        0,
        5
      )
    );
  };

  // Esc key to clear query
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
      !!data?.word &&
      favs.some((w) => w.toLowerCase() === data.word.toLowerCase()),
    [favs, data?.word]
  );

  const toggleFav = () => {
    if (!data?.word) return;
    const w = data.word.trim();
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
    if (!query.trim()) return;
    handleSubmit(query);
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
            Type a dish and press{' '}
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
                value={query}
                onChange={setQuery}
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
                  onClick={() => handleSubmit(w)}
                >
                  {w}
                </button>
              ))}
              F
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
                    onClick={() => handleSubmit(w)}
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
