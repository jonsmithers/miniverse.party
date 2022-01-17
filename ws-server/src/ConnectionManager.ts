import { Status } from 'https://deno.land/x/oak/mod.ts';
import { createHttpError } from 'https://deno.land/x/oak@v10.1.0/httpError.ts';

type Message = {
  type: 'position update';
} | {
  type: 'or something I guess I dunno';
};

interface ConnectionProps {
  userId: number;
  ws: WebSocket;
  room: number;
}

class Connection {
  ws: WebSocket;
  userId: number;
  room: number;
  /** Just for debugging. This should be deleted to avoid memory leak */
  receivedMessages: Message[] = [];
  constructor(props: ConnectionProps) {
    this.userId = props.userId;
    this.room = props.room;
    this.ws = props.ws;
    this.ws.onmessage = (messageEvent) => {
      if (typeof messageEvent.data !== 'string') {
        throw new Error('expected string, not ' + typeof messageEvent.data);
      }
      // JSON.parse can throw exceptions too
      console.log(`${this.userId} says`, JSON.parse(messageEvent.data));
    };
  }
}

export class ConnectionManager {
  connections: Map<number, Connection> = new Map();
  add(props: ConnectionProps) {
    if (this.connections.has(props.userId)) {
      throw createHttpError(
        Status.BadRequest,
        'this user already has a connection?',
      );
    }
    this.connections.set(props.userId, new Connection(props));
  }
}
