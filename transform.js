export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://quintonmasonaime.github.io');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { image, prompt } = req.body || {};
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) return res.status(400).json({ error: 'Please provide an image.' });
    if (image.length > 8_000_000) return res.status(413).json({ error: 'Image is too large.' });
    const safePrompt = String(prompt || 'Create a realistic interpretation of this child drawing.').slice(0, 900);
    const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(safePrompt) + '?width=1024&height=1024&nologo=true&enhance=true&image=' + encodeURIComponent(image);
    const response = await fetch(url);
    if (!response.ok) return res.status(502).json({ error: 'Image service unavailable.' });
    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'image/png'); res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch { return res.status(500).json({ error: 'Could not create the image.' }); }
}
