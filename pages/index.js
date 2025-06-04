import fs from 'fs';
import path from 'path';
import { useState } from 'react';

export async function getStaticProps() {
  const recipeDir = path.join(process.cwd(), 'data');
  const filenames = fs.readdirSync(recipeDir);
  const recipes = filenames.map(name => {
    const filePath = path.join(recipeDir, name);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContents);
    return { filename: name, ...data };
  });

  return { props: { recipes } };
}

export default function Home({ recipes }) {
  const [query, setQuery] = useState("");

  const filtered = recipes.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.ingredients?.join(" ").toLowerCase().includes(q) ||
      r.categories?.join(" ").toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Max’s Recipe Archive</h1>
      <input
        type="text"
        placeholder="Search titles, ingredients, categories..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          padding: '0.5rem',
          fontSize: '1rem',
          marginBottom: '1.5rem',
          width: '100%',
          maxWidth: '500px'
        }}
      />
      <ul>
        {filtered.map((recipe, i) => (
          <li key={i} style={{ marginBottom: '1.5rem' }}>
            <h3>{recipe.title}</h3>
            <p><strong>Source:</strong> {recipe.source}</p>
            <p><strong>Servings:</strong> {recipe.servings}</p>
            <p><strong>Categories:</strong> {recipe.categories?.join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
