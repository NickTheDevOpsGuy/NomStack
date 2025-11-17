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

    // both empty? do nothing
    if (!name && !protein) return;

    onSubmit?.(name, protein);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        className='w-full rounded border px-3 py-2'
        onKeyDown={handleKeyDown} // Enter submits
      />
      <input
        type='text'
        value={proteinValue}
        onChange={(e) => onProteinChange(e.target.value)}
        placeholder='Filter by protein (chicken, beef, tofu…)'
        className='mt-2 w-full rounded border px-3 py-2'
        onKeyDown={handleKeyDown} // Enter also submits
      />
    </>
  );
}
