import { Position } from './state';

interface MoveEvent {
  userId: number;
  position: Position;
  /** radians from north */
  direction: number;
  /** distance units per millisecond */
  velocity: number;
}
export class Connection {
  ws: Promise<WebSocket>;
  userId: number;
  private constructor(props: { ws: Promise<WebSocket>; userId: number }) {
    this.ws = props.ws;
    this.userId = props.userId;
  }
  async publishMovement(movement: Omit<MoveEvent, 'userId'>) {
    (await this.ws).send(JSON.stringify({
      ...movement,
      userId: this.userId,
    }));
  }
  async close() {
    (await this.ws).close();
  }
  static openNew(): Connection {
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!websocketUrl) {
      throw new Error('missing variable NEXT_PUBLIC_WEBSOCKET_URL');
    }
    const room = 1;
    const userId = Math.random();
    const ws = new Promise<WebSocket>((resolve) => {
      const newWebSocket = new WebSocket(
        `${websocketUrl}?userId=${userId}&room=${room}`,
      );
      newWebSocket.onopen = () => resolve(newWebSocket);
    });
    return new Connection({ ws, userId });
  }
}
