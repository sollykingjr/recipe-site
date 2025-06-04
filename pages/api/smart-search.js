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

    // Pre-filter: rough match on title, source, or ingredients
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
      .slice(0, 20); // Limit to 20 recipes max

    const prompt = `
You are a smart recipe search engine. Given a user's query and a list of brief recipe summaries, return the top 5 most relevant recipe slugs.

Query: "${query}"

Available recipes:
${matching.map(r => `- ${r.slug}: ${r.title}, from ${r.source}. Ingredients: ${r.ingredients}. ${r.summary}`).join('\n')}

Return ONLY a JSON array of slugs like: ["miso-glazed-salmon", "a-very-good-lasagna"]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Cheaper model
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
