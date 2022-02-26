import { Status } from 'https://deno.land/x/oak/mod.ts';
import { createHttpError } from 'https://deno.land/x/oak@v10.1.0/httpError.ts';
import {
  Message,
  RoomNumber,
  RoomStateMutator,
  UserId,
} from './sharedTypes.ts';

interface ConnectionProps {
  userId: UserId;
  ws: WebSocket;
  room: RoomNumber;
}

class Connection {
  ws: WebSocket;
  userId: UserId;
  room: RoomNumber;
  waitToOpen: Promise<void>;
  state: 'opening' | 'open' | 'closed';
  constructor(props: ConnectionProps) {
    this.userId = props.userId;
    this.room = props.room;
    this.ws = props.ws;
    this.state = 'opening';
    this.waitToOpen = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', () => {
        this.state = 'open';
        resolve();
      }, { once: true });
      setTimeout(() => {
        this.state = 'closed';
        reject();
      }, 1000);
    });
  }
  send(m: Message[]) {
    this.ws.send(JSON.stringify(m));
  }
}

export class ConnectionManager {
  connections: Map<UserId, Connection> = new Map();
  messageBuffers: Map<RoomNumber, Message[]> = new Map();
  roomStateMutators: Map<RoomNumber, RoomStateMutator> = new Map();
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
    newConnection.waitToOpen.then(() => {
      newConnection.send([{
        type: 'hydrate',
        roomState: this.getRoomStateMutator(props.room).roomState,
      }]);
    });
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
  getRoomStateMutator(room: RoomNumber): RoomStateMutator {
    if (!this.roomStateMutators.has(room)) {
      console.log(`creating room ${room}`);
      this.roomStateMutators.set(room, new RoomStateMutator());
    }
    return this.roomStateMutators.get(room)!;
  }
  publishBufferedMessages(room: RoomNumber) {
    const messageBuffer = this.messageBuffers.get(room);
    this.messageBuffers.delete(room);
    if (!messageBuffer?.length) {
      return;
    }

    // process
    for (const message of messageBuffer) {
      if (message.type === 'kick') {
        this.connections.delete(message.userId);
      }
      try {
        const roomStateMutator = this.getRoomStateMutator(room);
        roomStateMutator.applyEvent(message);
        if (roomStateMutator.isEmpty()) {
          console.log(`deleting room ${room}`);
          this.roomStateMutators.delete(room);
        }
      } catch (e) {
        // ideally we'd prevent this message from publishing
        console.error('failed to apply event', message, e);
      }
    }

    // publish
    for (const connection of this.connections.values()) {
      try {
        connection.send(messageBuffer);
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
