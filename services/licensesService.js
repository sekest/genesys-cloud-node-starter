import { getAccessToken } from './authService.js';

const ENVIRONMENT = process.env.GENESYS_CLOUD_ENVIRONMENT;

if (!ENVIRONMENT) {
  throw new Error('Missing GENESYS_CLOUD_ENVIRONMENT in environment variables');
}

export async function getLicenses() {
  try {
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

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    return data;

  } catch (error) {
    console.error('--- Licenses API Call Failed ---');

    if (error.name === 'AbortError') {
      console.error('Request timed out');
    } else {
      console.error('Error:', error.message);
    }

    throw new Error(`getLicenses failed: ${error.message}`);
  }
}