export class Connection {
  ws: WebSocket;
  userId: number;
  private constructor(props: { ws: WebSocket; userId: number }) {
    this.ws = props.ws;
    this.userId = props.userId;
  }
  close() {
    this.ws.close();
  }
  static openNew(): Connection {
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!websocketUrl) {
      throw new Error('missing variable NEXT_PUBLIC_WEBSOCKET_URL');
    }
    const room = 1;
    const userId = Math.random();
    const ws = new WebSocket(
      `${websocketUrl}?userId=${userId}&room=${room}`,
    );
    return new Connection({ ws, userId });
  }
}
