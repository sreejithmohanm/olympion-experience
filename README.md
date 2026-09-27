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
