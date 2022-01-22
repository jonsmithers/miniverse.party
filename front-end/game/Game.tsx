import { Container, Stage, Text } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { Suspense, useState } from 'react';
import { GameContextProvider } from './GameContext';
import { KeenCharacter, KeyboardControlPosition } from './KeenCharacter';
import { Connection } from './websocket';

export default function ComponentWrapper() {
  const [_connection] = useState(() => Connection.openNew());
  return (
    <Stage width={300} height={300} options={{ backgroundColor: 0xeef1f5 }}>
      <Suspense
        fallback={
          <Text
            text='loading'
            anchor={0.5}
            x={150}
            y={150}
            style={new PIXI.TextStyle({
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
        }
      >
        <GameContextProvider>
          <Game />
        </GameContextProvider>
      </Suspense>
    </Stage>
  );
}

function Game() {
  return (
    <>
      <KeyboardControlPosition>
        {(position, characterState) => (
          <KeenCharacter
            position={position}
            characterState={characterState}
          />
        )}
      </KeyboardControlPosition>
      <Container position={[150, 150]}>
      </Container>
      <Text
        text='Hello World'
        anchor={0.5}
        x={150}
        y={150}
        style={new PIXI.TextStyle({
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
    </>
  );
}
