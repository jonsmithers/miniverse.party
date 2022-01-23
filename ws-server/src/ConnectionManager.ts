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
  messageBuffers: Map<number, Message[]> = new Map();
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
          this.bufferMessage(props.room, message);
        });
        this.publishBufferedMessages(props.room);
      } catch (e) {
        console.error('unable to receive message...', e);
      }
    };
    this.connections.set(props.userId, newConnection);
  }
  bufferMessage(room: number, message: Message) {
    if (!this.messageBuffers.has(room)) {
      this.messageBuffers.set(room, []);
    }
    this.messageBuffers.get(room)!.push(message);
  }
  publishBufferedMessages(room: number) {
    const messageBuffer = this.messageBuffers.get(room);
    if (!messageBuffer?.length) {
      return;
    }
    const messageBufferStr = JSON.stringify(messageBuffer);
    for (const connection of this.connections.values()) {
      try {
        connection.ws.send(messageBufferStr);
      } catch (e) {
        console.error('unable to send message...', e);
        console.log(`kicking ${connection.userId}`);
        this.connections.delete(connection.userId);
      }
    }
    this.messageBuffers.delete(room);
  }
}
