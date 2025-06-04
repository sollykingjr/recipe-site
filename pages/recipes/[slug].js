import fs from 'fs';
import path from 'path';

export async function getStaticPaths() {
  const recipeDir = path.join(process.cwd(), 'data');
  const filenames = fs.readdirSync(recipeDir);

  const paths = filenames.map(name => {
    const slug = name.replace(/\.json$/, '');
    return { params: { slug } };
  });

  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const recipeDir = path.join(process.cwd(), 'data');
  const filePath = path.join(recipeDir, `${params.slug}.json`);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const recipe = JSON.parse(fileContents);

  return { props: { recipe } };
}

export default function RecipePage({ recipe }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '700px', margin: 'auto' }}>
      <h1>{recipe.title}</h1>
      <p><strong>Source:</strong> {recipe.source}</p>
      <p><strong>Servings:</strong> {recipe.servings}</p>
      <p><strong>Categories:</strong> {recipe.categories?.join(', ')}</p>

      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients?.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>Directions</h2>
      <ol>
        {recipe.directions?.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
