// in App.tsx
const [q, setQ] = useState("");

function handleSearch() {
  if (!q.trim()) return;
  console.log("SEARCH:", q);
}

return (
  <div>
    <input value={q} onChange={(e) => setQ(e.target.value)} />
    <button onClick={handleSearch}>Search</button>
  </div>
);