import type { KeyboardEvent } from 'react';

interface SearchBarProps {
  value: string; // dish name input
  onChange: (val: string) => void;
  proteinValue: string; // protein input
  onProteinChange: (val: string) => void;
  onSubmit?: (name: string, protein: string) => void;
}

export function SearchBar({
  value,
  proteinValue,
  onChange,
  onProteinChange,
  onSubmit,
}: SearchBarProps) {
  const submit = () => {
    const name = value.trim();
    const protein = proteinValue.trim();

    if (!name && !protein) return;
    onSubmit?.(name, protein);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='What dish are you looking for?'
        className='w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-50 dark:focus:border-sky-500 dark:focus:ring-sky-500'
        onKeyDown={handleKeyDown}
      />
      <input
        type='text'
        value={proteinValue}
        onChange={(e) => onProteinChange(e.target.value)}
        placeholder='Filter by protein (chicken, beef, tofu…)'
        className='mt-2 w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-50 dark:focus:border-sky-500 dark:focus:ring-sky-500'
        onKeyDown={handleKeyDown}
      />
    </>
  );
}
