import { once } from 'node:events';
import { createServer } from 'node:http';
import JWT from 'jsonwebtoken';

const PORT = 3000;
const JWT_KEY = 'pass123';

const DEFAULT_USER = {
  user: 'romesdev',
  password: 'pass42',
};

async function loginRoute(request, response) {
  const { user, password } = JSON.parse(await once(request, 'data'));
  if (user !== DEFAULT_USER.user || password !== DEFAULT_USER.password) {
    response.writeHead(401);
    response.end(JSON.stringify({ error: 'user invalid' }));
    return;
  }
  const token = JWT.sign({ user, message: 'hey dude!' }, JWT_KEY);
  response.end(JSON.stringify({ token }));
}

function isHeadersValid(headers) {
  try {
    const auth = headers.authorization.replace(/bearer\s/gi, '');
    JWT.verify(auth, JWT_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

async function handler(request, response) {
  if (request.url === '/login' && request.method == 'POST') {
    return loginRoute(request, response);
  }
  if (!isHeadersValid(request.headers)) {
    response.writeHead(400);
    return response.end(JSON.stringify({ error: 'invalid token' }));
  }
  response.end(JSON.stringify({ result: 'authenticated' }));
}

const app = createServer(handler).listen(PORT, () =>
  console.log(`listening at ${PORT}`)
);

export { app };
