import { Message, MovementData } from './sharedTypes';

interface ConstructOptions {
  onClose(): void;
}
export class Connection {
  /** May not be connected. If you want a guarantee that this ws is connected,
   * use {@link connectedPromise}. */
  ws: WebSocket;
  connectedPromise: Promise<WebSocket>;
  status: 'connecting' | 'connected' | 'closed';
  userId: number;
  room = 1;
  private constructor(props: ConstructOptions) {
    this.userId = Math.random();
    this.reconnect();
    this.onClose(props.onClose);
  }
  reconnect() {
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!websocketUrl) {
      throw new Error('missing variable NEXT_PUBLIC_WEBSOCKET_URL');
    }
    this.ws = new WebSocket(
      `${websocketUrl}?userId=${this.userId}&room=${this.room}`,
    );
    this.connectedPromise = new Promise<WebSocket>((resolve) => {
      this.ws.addEventListener('open', () => resolve(this.ws), {
        once: true,
      });
      this.ws.addEventListener('open', () => {
        this.status = 'connected';
      }, { once: true });
    });
    this.status = 'connecting';
  }
  async publishMovement(
    movement: MovementData,
  ) {
    const message: Message = {
      ...movement,
      type: 'move',
      userId: this.userId,
    };
    (await this.connectedPromise).send(JSON.stringify([message]));
  }
  async close() {
    (await this.connectedPromise).close();
  }
  onMessage(listener: (m: Message) => void): () => void {
    const wrappedListener = (m: MessageEvent) => {
      JSON.parse(m.data).forEach((message: Message) => {
        listener(message);
      });
    };
    this.ws.addEventListener('message', wrappedListener);
    return () => this.ws.removeEventListener('message', wrappedListener);
  }
  onClose(listener: () => void): () => void {
    this.ws.addEventListener('close', listener);
    return () => this.ws.removeEventListener('close', listener);
  }
  onOpen(listener: () => void): () => void {
    this.ws.addEventListener('open', listener);
    return () => this.ws.removeEventListener('open', listener);
  }
  static openNew(props: ConstructOptions): Connection {
    return new Connection(props);
  }
}
