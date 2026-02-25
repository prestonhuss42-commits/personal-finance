import axios from 'axios';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://personal-finance-e23w.onrender.com').replace(/\/$/, '');

export default async function handler(req, res) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  const targetUrl = `${BACKEND_URL}/api/${path}`;

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        Authorization: req.headers.authorization || undefined,
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      timeout: 55000,
      validateStatus: () => true,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    const message = error?.response?.data?.error || error?.message || 'Proxy request failed';
    return res.status(502).json({ error: message, target: targetUrl });
  }
}