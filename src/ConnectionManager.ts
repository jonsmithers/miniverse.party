import { Status } from "https://deno.land/x/oak/mod.ts";
import { createHttpError } from "https://deno.land/x/oak@v10.1.0/httpError.ts";

export class ConnectionManager {
  connections: Map<number, WebSocket> = new Map();
  add(userId: number, ws: WebSocket) {
    if (this.connections.has(userId)) {
      throw createHttpError(
        Status.BadRequest,
        "this user already has a connection?",
      );
    }
    this.connections.set(userId, ws);
  }
}
