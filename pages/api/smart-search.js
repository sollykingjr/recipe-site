const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const query = req.body.query;
  const recipeDir = path.join(process.cwd(), 'data');
  const filenames = fs.readdirSync(recipeDir);

  const recipes = filenames.map(name => {
    const content = fs.readFileSync(path.join(recipeDir, name), 'utf-8');
    const json = JSON.parse(content);
    return {
      slug: name.replace('.json', ''),
      text: `${json.title}\n${json.ingredients?.join(', ')}\n${json.directions?.join(' ')}`
    };
  });

  const prompt = `
You are a smart recipe search engine. Given the user's query and a list of recipe descriptions, return the top 5 matching recipe slugs.
Query: "${query}"

Available recipes:
${recipes.map(r => `- ${r.slug}: ${r.text}`).join('\n')}

Return ONLY a JSON array of the most relevant slugs, like: ["a-very-good-lasagna", "kimchi-fried-rice"]
`;

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const matchList = completion.data.choices[0].message.content.trim();

  try {
    const matches = JSON.parse(matchList);
    res.status(200).json({ matches });
  } catch {
    res.status(200).json({ matches: [] });
  }
}
