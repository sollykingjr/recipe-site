
import fs from 'fs';
import path from 'path';

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
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Max’s Recipe Archive</h1>
      <ul>
        {recipes.map((recipe, i) => (
          <li key={i}>
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
