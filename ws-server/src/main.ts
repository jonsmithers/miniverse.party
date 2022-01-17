import {
  Application,
  helpers,
  Router,
  send,
  Status,
} from 'https://deno.land/x/oak/mod.ts';
import { createHttpError } from 'https://deno.land/x/oak@v10.1.0/httpError.ts';
import { ConnectionManager } from './ConnectionManager.ts';

const app = new Application();

const connectionManager = new ConnectionManager();

const router: Router = new Router()
  .get('/websocket', (context) => {
    connectionManager.add({
      ws: context.upgrade(),
      userId: validateNumber('userId', helpers.getQuery(context).userId),
      room: validateNumber('room', helpers.getQuery(context).room),
    });
  });
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: 'index.html',
  });
});

function validateNumber(name: string, input: string): number {
  if (!input) {
    throw createHttpError(Status.BadRequest, `Missing ${name}`);
  }
  const result = Number(input);
  if (isNaN(result)) {
    throw createHttpError(Status.BadRequest, `${input} is not a number`);
  }
  return result;
}

console.log('listening at http://localhost:8000');
await app.listen({ port: 8000 });
