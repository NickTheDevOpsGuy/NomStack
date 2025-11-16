import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  proteinValue: string;
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

  return (
    <>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='What dish are you looking for?'
        className='w-full rounded border px-3 py-2'
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
      />
      <input
        type='text'
        value={proteinValue}
        onChange={(e) => onProteinChange(e.target.value)}
        placeholder='Filter by protein (chicken, beef, tofu…)'
        className='mt-2 w-full rounded border px-3 py-2'
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
      />
    </>
  );
}
