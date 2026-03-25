import axios from 'axios';
import { getAccessToken } from './authService.js';

const ENVIRONMENT = process.env.GENESYS_CLOUD_ENVIRONMENT;

if (!ENVIRONMENT) {
  throw new Error('Missing GENESYS_CLOUD_ENVIRONMENT in environment variables');
}

export async function getLicenses() {
  try {
    const token = await getAccessToken();

    const response = await axios.get(
      `https://api.${ENVIRONMENT}/api/v2/license/definitions`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      }
    );

    return response.data;

  } catch (error) {
    console.error('--- Licenses API Call Failed ---');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Body:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }

    throw new Error(`getLicenses failed: ${error.message}`);
  }
}