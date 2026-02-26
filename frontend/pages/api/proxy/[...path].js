import axios from 'axios';

const DEFAULT_BACKEND_URL = 'https://personal-finance-e23w.onrender.com';

function getBackendUrl() {
  const configured = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!configured) return DEFAULT_BACKEND_URL;
  const normalized = configured.replace(/\/$/, '');
  if (normalized.includes('localhost')) return DEFAULT_BACKEND_URL;
  return normalized;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
  const backendUrl = getBackendUrl();
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  const targetUrl = `${backendUrl}/api/${path}`;

  let lastError;
  let lastResponse;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: {
          Authorization: req.headers.authorization || undefined,
          'Content-Type': req.headers['content-type'] || 'application/json',
        },
        timeout: 90000,
        validateStatus: () => true,
      });

      if (response.status < 500) {
        return res.status(response.status).json(response.data);
      }

      lastResponse = response;
      lastError = new Error(`Upstream returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < 3) {
      await sleep(2000 * attempt);
    }
  }

  if (lastResponse) {
    const payload =
      typeof lastResponse.data === 'object' && lastResponse.data !== null
        ? { ...lastResponse.data, target: targetUrl }
        : { error: `Upstream returned ${lastResponse.status}`, target: targetUrl };
    return res.status(lastResponse.status).json(payload);
  }

  const message = lastError?.response?.data?.error || lastError?.message || 'Proxy request failed';
  return res.status(502).json({ error: message, target: targetUrl });
}