interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: (val: string) => void; // ← new
}

export function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  const submit = () => {
    console.log("Submitting:", value);
    if (!value.trim()) return; // guard empty
    onSubmit?.(value.trim()); // hand off to parent
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="What word piques your interest?"
      className="w-full rounded border px-3 py-2"
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
      }}
    />
  );
}
