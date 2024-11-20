import { Application } from 'jsr:@oak/oak/application';
import { Router } from 'jsr:@oak/oak/router';
import { ConnectionManager } from './ConnectionManager.ts';
import { send } from 'jsr:@oak/oak/send';
import { Status } from 'jsr:@oak/commons@^1.0/status';
import { createHttpError } from 'jsr:@oak/commons/http_errors';

const app = new Application();

const connectionManager = new ConnectionManager();

const requireTruthy = <T>(t: T | undefined | null | false): T => {
  if (!t) {
    throw new Error('non-truthy is not allowed here');
  }
  return t;
};

const router = new Router()
  .get('/websocket', (context) => {
    connectionManager.add({
      ws: context.upgrade(),
      userId: validateNumber(
        'userId',
        requireTruthy(context.request.url.searchParams.get('userId')),
      ),
      room: validateNumber(
        'room',
        requireTruthy(context.request.url.searchParams.get('room')),
      ),
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
