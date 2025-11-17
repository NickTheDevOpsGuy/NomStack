import { useState } from 'react';
import type { DishEntry } from '@/types/dish.types';

interface Props {
  data: DishEntry;
  term?: string; // used to highlight matches (optional)
}

export function DishResult({ data, term = '' }: Props) {
  const { name, variants } = data;
  if (!name) return null;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showVariants, setShowVariants] = useState(true);

  return (
    <section className='space-y-4' aria-live='polite'>
      <article className='rounded-2xl border border-sky-200 bg-white p-5 shadow-md dark:border-sky-700 dark:bg-slate-900'>
        <header className='flex items-center justify-between gap-3'>
          <h2 className='text-2xl font-bold tracking-tight text-slate-900 capitalize dark:text-sky-100'>
            {name}
          </h2>
          <button
            type='button'
            onClick={() => setShowVariants((v) => !v)}
            className='text-sm text-sky-700 hover:underline dark:text-sky-300'
          >
            {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
          </button>
        </header>

        <ul className='mt-4 space-y-4'>
          {showVariants && (
            <ul className='mt-4 space-y-4'>
              {variants.map((variant, i) => (
                <DefinitionItem
                  key={i}
                  sense={{
                    pos: variant.label ?? 'dish',
                    def: variant.description,
                    example: variant.exampleNote,
                  }}
                  term={term}
                  onSelect={() => setSelectedIndex(i)}
                  isSelected={selectedIndex === i}
                />
              ))}
            </ul>
          )}
        </ul>
      </article>
    </section>
  );
}

interface Sense {
  pos: string;
  def: string;
  example?: string;
}

interface DefinitionItemProps {
  sense: Sense;
  term: string;
  onSelect?: () => void;
  isSelected?: boolean;
}

function DefinitionItem({
  sense,
  term,
  onSelect,
  isSelected,
}: DefinitionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const limit = 260;
  const isLong = sense.def.length > limit;
  const displayed =
    !expanded && isLong ? sense.def.slice(0, limit) + '…' : sense.def;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(sense.def);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <li
      className={
        'rounded-xl border border-sky-200 bg-sky-50 p-4 transition hover:shadow-sm dark:border-sky-600 dark:bg-slate-900' +
        (isSelected
          ? ' border-sky-500 bg-sky-100/70 dark:border-sky-400/80 dark:bg-slate-800'
          : '')
      }
      onClick={onSelect}
    >
      <div className='flex items-start gap-3'>
        {/* POS tag */}
        <span className='shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] leading-5 tracking-wide text-sky-900 uppercase dark:bg-sky-900/60 dark:text-sky-100'>
          {sense.pos || 'slang'}
        </span>

        {/* Main content */}
        <div className='flex-1 space-y-2'>
          {displayed.split(/(?<=\.)\s+/).map((step, i) => (
            <p
              key={i}
              className='text-sm leading-relaxed break-words text-slate-800 dark:text-sky-50'
            >
              {highlight(step, term)}
            </p>
          ))}

          {/* Show more / less */}
          {isLong && (
            <button
              type='button'
              aria-expanded={expanded}
              className='text-xs text-sky-700 hover:underline dark:text-sky-300 dark:hover:text-sky-100'
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}

          {/* Example */}
          {sense.example && (
            <p className='border-l-2 border-sky-200 pl-3 text-sm text-slate-700 italic dark:border-sky-600 dark:text-sky-200'>
              “{sense.example.trim()}”
            </p>
          )}
        </div>

        {/* Copy button */}
        <div className='flex flex-col items-end gap-1'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className='rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-slate-800 hover:bg-sky-100 dark:border-sky-600 dark:bg-slate-800 dark:text-sky-100 dark:hover:bg-slate-700'
            aria-label='Copy definition to clipboard'
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </li>
  );
}

/** Highlight occurrences of `term` in `text` (case-insensitive). Escapes regex chars. */
function highlight(text: string, term: string) {
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((p, i) =>
    i % 2 ? (
      <mark key={i} className='rounded bg-sky-200 px-0.5 dark:bg-sky-700/70'>
        {p}
      </mark>
    ) : (
      p
    )
  );
}

export default DishResult;