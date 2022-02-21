import { Status } from 'https://deno.land/x/oak/mod.ts';
import { createHttpError } from 'https://deno.land/x/oak@v10.1.0/httpError.ts';
import { Message } from './sharedTypes.ts';

interface ConnectionProps {
  userId: UserId;
  ws: WebSocket;
  room: RoomNumber;
}
type UserId = number;
type RoomNumber = number;

class Connection {
  ws: WebSocket;
  userId: UserId;
  room: RoomNumber;
  constructor(props: ConnectionProps) {
    this.userId = props.userId;
    this.room = props.room;
    this.ws = props.ws;
  }
}

export class ConnectionManager {
  connections: Map<UserId, Connection> = new Map();
  messageBuffers: Map<RoomNumber, Message[]> = new Map();
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
      } catch (e) {
        console.error('unable to receive message...', e);
      }
    };
    this.connections.set(props.userId, newConnection);
  }
  bufferMessage(room: RoomNumber, message: Message) {
    if (!this.messageBuffers.has(room)) {
      this.messageBuffers.set(room, []);
    }
    this.messageBuffers.get(room)!.push(message);
    this.publishBufferedMessagesNextTick(room);
  }
  publishBufferedMessagesNextTick = debounce((room: RoomNumber) =>
    this.publishBufferedMessages(room)
  );
  publishBufferedMessages(room: RoomNumber) {
    const messageBuffer = this.messageBuffers.get(room);
    if (!messageBuffer?.length) {
      return;
    }

    // process
    for (const message of messageBuffer) {
      if (message.type === 'kick') {
        this.connections.delete(message.userId);
      }
    }

    // publish
    const messageBufferStr = JSON.stringify(messageBuffer);
    this.messageBuffers.delete(room);
    for (const connection of this.connections.values()) {
      try {
        connection.ws.send(messageBufferStr);
      } catch (e) {
        console.error('unable to send message...', e);
        console.log(`kicking ${connection.userId}`);
        this.bufferMessage(room, {
          type: 'kick',
          userId: connection.userId,
        });
      }
    }
  }
}

function debounce<T>(fn: (t: T) => void): (t: T) => void {
  const timerId: { current?: number } = {
    current: undefined,
  };
  return (t: T) => {
    clearTimeout(timerId.current);
    timerId.current = setTimeout(() => {
      fn(t);
    });
  };
}
