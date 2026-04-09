import { getAccessToken } from './authService.js';

const ENVIRONMENT = process.env.GENESYS_CLOUD_ENVIRONMENT;

if (!ENVIRONMENT) {
  throw new Error('Missing GENESYS_CLOUD_ENVIRONMENT in environment variables');
}

export async function getLicenses() {
  const token = await getAccessToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(
    `https://api.${ENVIRONMENT}/api/v2/license/definitions`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: controller.signal
    }
  );

  clearTimeout(timeout);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}