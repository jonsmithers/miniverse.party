import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react';
import { useConnection } from './websocket';

export default function ComponentWrapper() {
  console.log('rendering game');
  const divRef = useRef<HTMLDivElement>(null);
  const connection = useConnection();
  console.log('connection', connection);
  useEffect(() => {
    const canvas = createGame();
    divRef.current?.appendChild(canvas);
  }, []);
  return (
    <div ref={divRef}/>
  );
}

function createGame() {
  const app = new PIXI.Application();
  return app.view;
}


// export function usePixi() {
//   const [pixi, setPixi] = useState();
//
//   useEffect(() => {
//     (async () => {
//       if (!pixi) {
//         await import("@inlet/react-pixi/legacy").then((p) => {
//           setPixi(p);
//         });
//       }
//     })();
//   }, []);
//
//   return pixi;
// }
