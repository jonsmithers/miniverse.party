import {
  Application,
  helpers,
  Router,
  send,
  Status,
} from "https://deno.land/x/oak/mod.ts";
import { createHttpError } from "https://deno.land/x/oak@v10.1.0/httpError.ts";
import { ConnectionManager } from "./ConnectionManager.ts";

const app = new Application();

const router: Router = new Router()
  .get("/route", (context) => {
    context.response.body = "Hello world from router";
  })
  .get("/websocket", (context) => {
    const userIdStr = helpers.getQuery(context).userId;
    if (!userIdStr) {
      throw createHttpError(Status.BadRequest, "you gotta pick a user id");
    }
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      throw createHttpError(Status.BadRequest, "Can't use NaN");
    }
    const ws = context.upgrade();
    ws.onmessage = (x) => {
      console.log("message", x);
    };
  });
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
});

console.log("listening at http://localhost:8000");
await app.listen({ port: 8000 });

const connectionManager = new ConnectionManager();
