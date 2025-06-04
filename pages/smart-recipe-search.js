import { useState } from 'react';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setResults([]);
    const res = await fetch('/api/smart-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    setResults(data.matches || []);
    setLoading(false);
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Smart Recipe Search</h1>
      <input
        type="text"
        placeholder="e.g. something with mushrooms and lemon"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: '0.5rem',
          fontSize: '1rem',
          width: '100%',
          maxWidth: '500px',
          marginRight: '1rem'
        }}
      />
      <button onClick={handleSearch} style={{ padding: '0.5rem 1rem' }}>
        Search
      </button>

      {loading && <p>Searching...</p>}

     {Array.isArray(results) && results.length > 0 ? (
  <ul style={{ marginTop: '2rem' }}>
    {results.map((slug) => (
      <li key={slug}>
        <a href={`/recipes/${slug}`} style={{ color: '#0070f3' }}>
          {typeof slug === 'string' ? slug.replace(/-/g, ' ') : ''}
        </a>
      </li>
    ))}
  </ul>
) : results?.error ? (
  <p style={{ color: 'red', marginTop: '1rem' }}>⚠️ {results.error}</p>
) : (
  !loading && query && <p style={{ marginTop: '1rem' }}>No matches found.</p>
)}
    </div>
  );
}
