import { useEffect, useRef, useState } from "react";

class Connection {
  ws: WebSocket;
  userId: number;
  private constructor(props: { ws: WebSocket, userId: number }) {
    this.ws = props.ws;
    this.userId = props.userId;
  }
  static openNew(): Connection {
    const room = 1;
    const userId = Math.random();
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL!}?userId=${userId}&room=${room}`);
    return new Connection({ ws, userId });
  }
}

export const useConnection = () => {
  const [connection] = useState<Connection>(() => Connection.openNew());
  return connection;
}
