const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const query = req.body.query || '';
    const recipeDir = path.join(process.cwd(), 'data');
    const filenames = fs.readdirSync(recipeDir);

    const matching = filenames
      .map(name => {
        const content = fs.readFileSync(path.join(recipeDir, name), 'utf-8');
        const json = JSON.parse(content);
        return {
          slug: name.replace('.json', ''),
          title: json.title || '',
          source: json.source || '',
          ingredients: json.ingredients?.join(', ') || '',
          summary: json.description || ''
        };
      })
      .filter(r => {
        const q = query.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q) ||
          r.ingredients.toLowerCase().includes(q)
        );
      })
      .slice(0, 20);

    const prompt = `
You are a smart recipe search engine. Given a user's query and a list of recipe summaries, return the top 5 most relevant slugs.

Query: "${query}"

Available recipes:
${matching.map(r => `- ${r.slug}: ${r.title}, from ${r.source}. Ingredients: ${r.ingredients}. ${r.summary}`).join('\n')}

Here are the valid recipe slugs:

[${matching.map(r => `"${r.slug}"`).join(', ')}]

From these slugs only, return up to 5 in a JSON array.
Do not invent new slugs. Use only the ones listed above exactly as shown.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const matchList = completion.choices[0].message.content.trim();

    let matches;
    try {
      matches = JSON.parse(matchList);
    } catch (err) {
      return res.status(200).json({ error: 'Invalid JSON from GPT', raw: matchList });
    }

    res.status(200).json({ matches });
  } catch (error) {
    console.error('SMART SEARCH API ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
}
