import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello world!";
});

console.log('listening at http://localhost:8000');
await app.listen({ port: 8000 });
