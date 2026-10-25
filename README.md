# olympion-experience

Olympion Experience - customer-facing SaaS product: website, marketplace, workforce console.

## Run with Docker

### Prerequisites

- Docker Desktop with Docker Compose v2

From the repository root, build and start both applications:

```bash
docker compose up --build
```

Open the applications at:

- Website: http://localhost:3000
- Workforce console: http://localhost:3001

The website runs as a Next.js standalone server. The workforce console is built as a static export and served by Nginx.

Set `NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL` to the browser-accessible Workforce
OS API origin when building either application. The same value configures the
website and workforce console, including their marketplace SSE connections.
The API must allow requests and event streams from both application origins.
If unset, both applications use same-origin `/v1` routes, so the hosting origin
must reverse-proxy those routes to Workforce OS.

The browser dispatches `olympion:marketplace-stream` custom events with
connection-attempt, connection, and error counters. Browser monitoring can
subscribe to this event for stream metrics. Stream failures are also announced
as accessible alerts while the clients retry and use periodic refreshes.

## End-to-end tests

Run the marketplace publish/unpublish flow test from the website workspace:

```bash
cd apps/website
npm ci --workspaces=false
cd ../workforce-console
npm ci --workspaces=false
cd ../website
npx playwright install chromium
npm run test:e2e
```

The test starts local website, workforce-console, and mock Workforce OS API
servers. Production deployments should configure the same API base URL through
`NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL` for both apps.

Useful commands:

```bash
# Start in the background
docker compose up --build -d

# Follow service logs
docker compose logs -f

# Rebuild one application
docker compose build website
docker compose build workforce-console

# Stop and remove the containers
docker compose down
```

To run only one application, use its Compose service name:

```bash
docker compose up --build website
docker compose up --build workforce-console
```
