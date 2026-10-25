import { createServer } from 'node:http';

const port = Number(process.env.WORKFORCE_OS_MOCK_PORT ?? 4000);
const streams = new Set();
let streamEnabled = true;
const listing = {
  id: 'listing-1',
  displayName: 'Ari Architect',
  role: 'Solution Architecture',
  description: 'An experienced digital professional.',
  skills: ['Architecture'],
  published: false
};

function token(payload) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'none', typ: 'JWT' })
  ).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, ...payload })
  ).toString('base64url');
  return `${header}.${body}.test`;
}

function sendJson(response, body) {
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(body));
}

function broadcast(event) {
  for (const response of streams) {
    response.write(`event: marketplace.employee.${event}\ndata: {}\n\n`);
  }
}

const server = createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type'
  );
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (url.pathname === '/health') {
    response.writeHead(200);
    response.end('ok');
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/auth/token') {
    sendJson(response, {
      access_token: token({ roles: ['olympion-workforce-admin'] })
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/auth/customer/login') {
    sendJson(response, {
      access_token: token({ sub: 'customer-1' }),
      refresh_token: 'customer-refresh-token'
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/catalog') {
    sendJson(response, { templates: listing.published ? [listing] : [] });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === '/v1/marketplace/employees/events'
  ) {
    if (!streamEnabled) {
      response.writeHead(503);
      response.end();
      return;
    }
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive'
    });
    response.write(': connected\n\n');
    streams.add(response);
    request.on('close', () => streams.delete(response));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/__test/disable-stream') {
    streamEnabled = false;
    for (const stream of streams) {
      stream.end();
    }
    streams.clear();
    response.writeHead(204);
    response.end();
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === '/v1/admin/marketplace/listings'
  ) {
    sendJson(response, { listings: [listing] });
    return;
  }

  if (
    request.method === 'GET' &&
    /^\/v1\/admin\/marketplace\/listings\/[^/]+\/audit$/.test(url.pathname)
  ) {
    sendJson(response, { audit: [] });
    return;
  }

  const publishAction = url.pathname.match(
    /^\/v1\/admin\/marketplace\/listings\/listing-1\/(publish|unpublish)$/
  );
  if (request.method === 'POST' && publishAction) {
    listing.published = publishAction[1] === 'publish';
    broadcast(listing.published ? 'published' : 'unpublished');
    sendJson(response, { listing });
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'Not found' }));
});

server.listen(port, '127.0.0.1');

function shutdown() {
  for (const stream of streams) {
    stream.end();
  }
  server.close();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
