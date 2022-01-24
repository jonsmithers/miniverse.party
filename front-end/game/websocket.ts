import { Message, MovementData } from './sharedTypes';

export class Connection {
  ws: Promise<WebSocket>;
  userId: number;
  private constructor(props: { ws: Promise<WebSocket>; userId: number }) {
    this.ws = props.ws;
    this.userId = props.userId;
  }
  async publishMovement(
    movement: MovementData,
  ) {
    const message: Message = {
      ...movement,
      type: 'move',
      userId: this.userId,
    };
    (await this.ws).send(JSON.stringify([message]));
  }
  async close() {
    (await this.ws).close();
  }
  onMessage(listener: (m: Message) => void): () => void {
    const wrappedListener = (m: MessageEvent) => {
      JSON.parse(m.data).forEach((message: Message) => {
        listener(message);
      });
    };
    (this.ws).then((ws) => ws.addEventListener('message', wrappedListener));
    return () =>
      (this.ws).then((ws) =>
        ws.removeEventListener('message', wrappedListener)
      );
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
      newWebSocket.addEventListener('open', () => resolve(newWebSocket));
    });
    return new Connection({ ws, userId });
  }
}
