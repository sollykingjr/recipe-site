export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const query = req.body.query || 'no query';

  // Simulate a successful match
  const fakeMatches = [
    'a-very-good-lasagna',
    'spinach-mushroom-frittata',
    'miso-glazed-salmon'
  ];

  res.status(200).json({ matches: fakeMatches });
}
