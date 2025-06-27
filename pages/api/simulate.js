/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export default async function handler(req, res) {
  const input = req.method === 'GET' ? req.query : req.body;
  const data = input.data || '';
  const delayMin = parseInt(input.delay_min, 10) || 0;
  const delayMax = parseInt(input.delay_max, 10) || delayMin;
  const forceStatus = input.force_status ? parseInt(input.force_status, 10) : undefined;
  const simulateError = input.simulate_error === 'true' || input.simulate_error === true;

  let decoded;
  let error;

  try {
    const json = Buffer.from(data, 'base64').toString('utf8');
    decoded = JSON.parse(json);
  } catch (err) {
    error = 'Invalid base64 JSON';
  }

  const delayMs = Math.floor(Math.random() * (delayMax - delayMin + 1)) + delayMin;
  await new Promise(r => setTimeout(r, delayMs));

  let status = 200;
  if (simulateError && !forceStatus) {
    const rand = Math.random();
    if (rand < 0.2) status = 500;
    else if (rand < 0.3) status = 400;
  }
  if (forceStatus) {
    status = forceStatus;
  }

  const body = error || status >= 400
    ? { delay_ms: delayMs, status_code: status, error: error || 'Simulated server error' }
    : { delay_ms: delayMs, status_code: status, decoded };

  res.status(status).json(body);
}
