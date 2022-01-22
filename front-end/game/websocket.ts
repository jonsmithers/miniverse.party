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
    const room = 1;
    const userId = Math.random();
    const ws = new WebSocket(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL!}?userId=${userId}&room=${room}`,
    );
    return new Connection({ ws, userId });
  }
}
