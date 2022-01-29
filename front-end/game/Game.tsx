import { Stage, Text, useTick } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { Suspense, useEffect, useRef } from 'react';
import { GameContextProvider, useGameContext } from './GameContextProvider';
import { KeenCharacter } from './KeenCharacter';
import { useDispatch, useSelector } from './state/rootStore';

export default function ComponentWrapper() {
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

function EventPublisher() {
  const { connection } = useGameContext();
  const myCharacter = useSelector((store) =>
    store.everything.characters[store.everything.userId]
  );
  const { velocity, direction, state, position } = myCharacter;

  const positionRef = useRef(position);
  positionRef.current = position;

  useEffect(() => {
    connection.publishMovement({
      velocity,
      direction,
      state,
      position: positionRef.current,
    });
  }, [velocity, direction, state, connection]);
  return <></>;
}

function Characters() {
  const characters = useSelector((store) => store.everything.characters);
  return (
    <>
      {Object.entries(characters).map(([userId, character]) => (
        <KeenCharacter
          key={userId}
          characterState={character.state}
          position={character.position}
        />
      ))}
    </>
  );
}

function Ticker() {
  const { actions } = useGameContext();
  const dispatch = useDispatch();
  useTick((_, ticker) => {
    dispatch(actions.tick({ elapsedMillis: ticker.elapsedMS }));
  });
  return <></>;
}

function Game() {
  return (
    <>
      <EventPublisher />
      <Characters />
      <Ticker />
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
