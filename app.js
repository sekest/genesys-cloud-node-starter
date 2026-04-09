import 'dotenv/config';
import http from 'node:http';
import { getLicenses } from './services/licensesService.js';

const PORT = process.env.PORT || 3000;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && requestUrl.pathname === '/') {
    sendText(res, 200, 'Genesys Cloud middleware app is running.');
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/licenses') {
    try {
      const data = await getLicenses();

      sendJson(res, 200, {
        success: true,
        data
      });
    } catch (error) {
      console.error(error.message);

      sendJson(res, 500, {
        success: false,
        error: error.message
      });
    }

    return;
  }

  sendText(res, 404, 'Not found');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
