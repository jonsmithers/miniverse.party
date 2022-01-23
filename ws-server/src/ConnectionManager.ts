import { Status } from 'https://deno.land/x/oak/mod.ts';
import { createHttpError } from 'https://deno.land/x/oak@v10.1.0/httpError.ts';
import { Message } from './sharedTypes.ts';

interface ConnectionProps {
  userId: number;
  ws: WebSocket;
  room: number;
}

class Connection {
  ws: WebSocket;
  userId: number;
  room: number;
  constructor(props: ConnectionProps) {
    this.userId = props.userId;
    this.room = props.room;
    this.ws = props.ws;
  }
}

export class ConnectionManager {
  connections: Map<number, Connection> = new Map();
  messageBuffer: Message[] = [];
  add(props: ConnectionProps) {
    if (this.connections.has(props.userId)) {
      throw createHttpError(
        Status.BadRequest,
        'this user already has a connection?',
      );
    }
    const newConnection = new Connection(props);
    newConnection.ws.onmessage = (messageEvent) => {
      try {
        JSON.parse(messageEvent.data).forEach((message: Message) => {
          this.bufferMessage(message);
        });
        this.publishBufferedMessages();
      } catch (e) {
        console.error('oh dear...', e);
      }
    };
    this.connections.set(props.userId, newConnection);
  }
  bufferMessage(message: Message) {
    this.messageBuffer.push(message);
  }
  publishBufferedMessages() {
    if (!this.messageBuffer.length) {
      return;
    }
    const messageBufferStr = JSON.stringify(this.messageBuffer);
    for (const connection of this.connections.values()) {
      connection.ws.send(messageBufferStr);
    }
    this.messageBuffer = [];
  }
}
