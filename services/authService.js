const CLIENT_ID = process.env.GENESYS_CLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.GENESYS_CLOUD_CLIENT_SECRET;
const ENVIRONMENT = process.env.GENESYS_CLOUD_ENVIRONMENT;

const missing = [];
if (!CLIENT_ID) missing.push('GENESYS_CLOUD_CLIENT_ID');
if (!CLIENT_SECRET) missing.push('GENESYS_CLOUD_CLIENT_SECRET');
if (!ENVIRONMENT) missing.push('GENESYS_CLOUD_ENVIRONMENT');
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

let cachedAccessToken = null;
let tokenExpiresAt = 0;

function getCachedToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  return null;
}

export async function getAccessToken() {
  const cachedToken = getCachedToken();
  if (cachedToken) {
    console.log('Using cached access token');
    return cachedToken;
  }

  const tokenUrl = `https://login.${ENVIRONMENT}/oauth/token`;

  const body = new URLSearchParams();
  body.append('grant_type', 'client_credentials');

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`
    },
    body: body.toString(),
    signal: controller.signal
  });

  clearTimeout(timeout);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  if (data.error) {
    throw new Error(`OAuth error: ${data.error}`);
  }

  if (!data.access_token) {
    throw new Error('No access_token returned from token endpoint');
  }

  const expiresIn = Number(data.expires_in) || 3600;
  const bufferInSeconds = 60;
  const cacheSeconds = Math.max(expiresIn - bufferInSeconds, 30);

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + cacheSeconds * 1000;

  console.log(`Fetched new access token. Cached for ${cacheSeconds} seconds.`);

  return cachedAccessToken;
}