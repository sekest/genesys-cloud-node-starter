# Genesys Cloud Node Starter

Small Express application that authenticates against Genesys Cloud with the OAuth 2.0 client credentials flow, caches the bearer token in memory, and exposes a local endpoint that proxies the Genesys Cloud license definitions API.

## What This App Does

- Loads configuration from `.env`
- Starts an Express server
- Requests an OAuth access token from `https://login.<environment>/oauth/token`
- Reuses the token until shortly before expiration
- Calls `https://api.<environment>/api/v2/license/definitions`
- Returns the Genesys Cloud response from a local `/licenses` route

This is a useful starter for middleware, internal tools, or service-to-service integrations where no end-user login flow is needed.

## Current Endpoints

### `GET /`

Simple health-style route.

Example response:

```json
"Genesys Cloud middleware app is running."
```

### `GET /licenses`

Fetches Genesys Cloud license definitions by:

1. Getting a cached access token when available
2. Requesting a new token when the cache is empty or expired
3. Calling the Genesys Cloud licenses endpoint
4. Returning the upstream payload inside a local success envelope

Example success shape:

```json
{
  "success": true,
  "data": {
    "entities": []
  }
}
```

Example error shape:

```json
{
  "success": false,
  "error": "getLicenses failed: ..."
}
```

## Project Structure

```text
.
|-- app.js
|-- services/
|   |-- authService.js
|   `-- licensesService.js
|-- .env.example
`-- README.md
```

### File Roles

- `app.js`: Express bootstrap and route registration
- `services/authService.js`: OAuth token request, config validation, and in-memory token cache
- `services/licensesService.js`: Authorized request to Genesys Cloud license definitions

## Requirements

- Node.js 18+ recommended
- A Genesys Cloud OAuth client configured for client credentials
- Permission to call the Genesys Cloud licenses API in your target org

## Configuration

Create a `.env` file from `.env.example` and supply your Genesys Cloud credentials.

### Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Local server port. Defaults to `3000`. |
| `GENESYS_CLOUD_CLIENT_ID` | Yes | OAuth client ID from Genesys Cloud |
| `GENESYS_CLOUD_CLIENT_SECRET` | Yes | OAuth client secret from Genesys Cloud |
| `GENESYS_CLOUD_ENVIRONMENT` | Yes | Genesys Cloud region domain, for example `usw2.pure.cloud` |

The app builds these URLs from `GENESYS_CLOUD_ENVIRONMENT`:

- Token endpoint: `https://login.<environment>/oauth/token`
- API endpoint: `https://api.<environment>/api/v2/license/definitions`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

If you are using PowerShell:

```powershell
Copy-Item .env.example .env
```

### 3. Start the server

```bash
npm start
```

For local development:

```bash
npm run dev
```

The app will start on `http://localhost:3000` unless `PORT` is overridden.

## Example Requests

Check that the app is running:

```bash
curl http://localhost:3000/
```

Fetch license definitions:

```bash
curl http://localhost:3000/licenses
```

## How Token Caching Works

- Tokens are cached in process memory
- Cached tokens are reused until shortly before expiration
- The cache buffer is 60 seconds
- If the token lifetime is very short, the app still keeps a minimum 30-second cache window

This keeps repeated API calls from requesting a new token every time.

## Error Handling

The application logs:

- OAuth request failures
- Genesys Cloud API failures
- HTTP status codes and response bodies when available
- Network/no-response conditions

The `/licenses` route converts service errors into a `500` response with a simple JSON error payload.

## Limitations

- Token cache is per-process only and is lost on restart
- No retry or backoff behavior is implemented
- No automated tests are included yet
- Only one downstream Genesys Cloud route is currently exposed
- Logging is console-based and not structured

## Good Next Steps

- Add more Genesys Cloud endpoints behind local routes
- Add request validation and centralized error middleware
- Add automated tests for auth and service behavior
- Add a health endpoint that verifies configuration separately from API access
- Move token caching to Redis or another shared store if you run multiple instances
