export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not set' });

  try {
        const { prompt, imageBase64, imageMime } = req.body;

      const parts = [];
        if (imageBase64) {
                parts.push({ inline_data: { mime_type: imageMime, data: imageBase64 } });
        }
        parts.push({ text: prompt });

      const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contents: [{ parts }] }),
        }
            );

      const data = await response.json();

      if (!response.ok) {
              console.error('Gemini API error:', JSON.stringify(data));
              return res.status(200).json({ text: '' });
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({ text });

  } catch (e) {
        console.error('Handler error:', e.message);
        return res.status(200).json({ text: '' });
  }
}
