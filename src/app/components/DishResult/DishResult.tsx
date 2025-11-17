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
      <article className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-md dark:border-zinc-700 dark:bg-zinc-900'>
        <header className='flex items-center justify-between gap-3'>
          <h2 className='text-2xl font-bold tracking-tight text-zinc-900 capitalize dark:text-zinc-100'>
            {name}
          </h2>
          <button
            type='button'
            onClick={() => setShowVariants((v) => !v)}
            className='text-sm text-zinc-600 hover:underline dark:text-zinc-400'
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
  const [showVariants, setShowVariants] = useState(true);

  const steps = sense.def.split(/(?<=\.)\s+/);
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
        'rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800' +
        (isSelected
          ? ' border-indigo-500 bg-indigo-50/40 dark:border-indigo-400/80'
          : '')
      }
      onClick={onSelect}
    >
      <div className='flex items-start gap-3'>
        <span className='shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] leading-5 tracking-wide text-zinc-700 uppercase dark:bg-zinc-700 dark:text-zinc-100'>
          {sense.pos || 'slang'}
        </span>

        <div className='flex-1 space-y-2'>
          {displayed.split(/(?<=\.)\s+/).map((step, i) => (
            <p
              key={i}
              className='text-sm leading-relaxed break-words text-zinc-800 dark:text-zinc-100'
            >
              {highlight(step, term)}
            </p>
          ))}

          {isLong && (
            <button
              type='button'
              aria-expanded={expanded}
              className='text-xs text-indigo-600 hover:underline dark:text-indigo-400'
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}

          {sense.example && (
            <p className='border-l-2 border-zinc-200 pl-3 text-sm text-zinc-600 italic dark:border-zinc-700 dark:text-zinc-400'>
              “{sense.example.trim()}”
            </p>
          )}
        </div>

        <div className='flex flex-col items-end gap-1'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className='rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700'
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
      <mark
        key={i}
        className='rounded bg-yellow-200 px-0.5 dark:bg-yellow-600/50'
      >
        {p}
      </mark>
    ) : (
      p
    )
  );
}

export default DishResult;
