import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

const router: Router = new Router()
  .get("/route", (context) => {
    context.response.body = "Hello world from router";
  })
  .get("/websocket", (context) => {
    const ws = context.upgrade();
    console.log("ws", ws);
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
