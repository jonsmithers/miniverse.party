import { Container, Sprite, Stage, Text } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js'
import { useEffect, useRef } from 'react';
import { KeenCharacter, KeenStates } from './KeenCharacter';
import { Connection } from './websocket';

export default function ComponentWrapper() {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {

    const loader: PIXI.Loader = new PIXI.Loader()
    loader.add('keen', '/game-assets/keen.json');
    loader.load((_, resources) => {
      console.log('resources', resources);
    });
    const resourceLoadPromise = new Promise<PIXI.Loader>((resolve, reject) => {
      loader.onComplete.add(resolve);
      loader.onError.add(reject);
    });
    resourceLoadPromise
      .then(() => console.log('successfully loaded resources'))
      .catch((e) => console.error('error loading game resource:', e));

    const app = createGame();
    resourceLoadPromise.then((loadedLoader) => {
      const keenChracter = new KeenCharacter(loadedLoader);
      keenChracter.state = KeenStates.runLeft;
      keenChracter.x = 150
      keenChracter.y = 5
      console.log('keenChracter', keenChracter);
      // @ts-ignore
      window.keenChar = keenChracter;
      app.stage.addChild(keenChracter);
      const stateRef = { current: true }
      setInterval(() => {
        stateRef.current = !stateRef.current;
        keenChracter.state = stateRef.current ? KeenStates.runLeft : KeenStates.runRight;
      }, 2000);
      PIXI.Ticker.shared.add(() => {
        if (stateRef.current) {
          // TODO compute new coordinate based on time elapsed and fixed velocity
          keenChracter.x -= 1;
        } else {
          keenChracter.x += 1;
        }
      });
    });

    // const animation = keenSheet!.animations["run right"]
    // console.log('animation', animation);
    const connection = Connection.openNew();
    divRef.current?.appendChild(app.view);
    return () => {
      app.stop();
      app.view.remove();
      connection.close();
    }
  }, []);
  return (
    <>
      <div ref={divRef} />
      <Stage width={300} height={300} options={{ backgroundColor: 0xeef1f5 }}>
        <Container position={[150, 150]}>
        </Container>
        <Text
          text="Hello World"
          anchor={0.5}
          x={150}
          y={150}
          style={
            new PIXI.TextStyle({
              align: 'center',
              fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
              fontSize: 50,
              fontWeight: '400',
              fill: ['#ffffff', '#00ff99'], // gradient
              stroke: '#01d27e',
              strokeThickness: 5,
              letterSpacing: 20,
              dropShadow: true,
              dropShadowColor: '#ccced2',
              dropShadowBlur: 4,
              dropShadowAngle: Math.PI / 6,
              dropShadowDistance: 6,
              wordWrap: true,
              wordWrapWidth: 440,
            })}
        />
      </Stage>
    </>
  );
}

function createGame() {
  return new PIXI.Application();
}
