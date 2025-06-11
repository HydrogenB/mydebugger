// Serverless function to expose request cookies
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader
    .split(';')
    .map((c) => {
      const [name, ...rest] = c.trim().split('=');
      return { name, value: rest.join('=') };
    })
    .filter((c) => c.name);

  res.status(200).json({ cookies });
}
