import { Stage, Text, useTick } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { Suspense, useEffect } from 'react';
import { GameContextProvider, useGameContext } from './GameContextProvider';
import { KeenCharacter } from './KeenCharacter';
import { useDispatch, useSelector } from './state/rootStore';
import { characterActions } from './state/character';
import { toRadians } from './utils';

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

function useKeyboardController() {
  const position = useSelector((state) => state.character.position);
  const characterState = useSelector((state) => state.character.state);
  const keystate = useSelector((state) => state.keyboard);
  const dispatch = useDispatch();
  useTick((_, { elapsedMS: elapsed }) => {
    const direction = (() => {
      const right = keystate['ArrowRight'] || keystate['d'];
      const left = keystate['ArrowLeft'] || keystate['a'];
      const up = keystate['ArrowUp'] || keystate['w'];
      const down = keystate['ArrowDown'] || keystate['s'];
      if (right && left) {
        return 0;
      }
      if (up && right) {
        return toRadians(45);
      }
      if (right && down) {
        return toRadians(135);
      }
      if (left && down) {
        return toRadians(225);
      }
      if (left && up) {
        return toRadians(315);
      }
      if (left) {
        return toRadians(270);
      }
      if (right) {
        return toRadians(90);
      }
      if (down) {
        return toRadians(180);
      }
      if (up) {
        return toRadians(0);
      }
      return undefined;
    })();
    if (direction === undefined) {
      dispatch(characterActions.idle());
    } else {
      dispatch(characterActions.move({ direction, elapsed }));
    }
  });
  return { position, characterState };
}

function EventPublisher() {
  const { connection } = useGameContext();
  const { velocity, direction, position, facing, state } = useSelector((
    store,
  ) => store.character);
  useEffect(() => {
    connection.publishMovement({
      velocity,
      direction,
      position,
      facing,
      state,
    });
  }, [velocity, direction, position, facing, state, connection]);
  return <></>;
}

function Logger() {
  // use this when you want to log something
  useSelector((store) => store.otherPlayers.characters);
  return <></>;
}

function OtherPlayers() {
  const characters = useSelector((store) => store.otherPlayers.characters);
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

function Game() {
  const { position, characterState } = useKeyboardController();
  return (
    <>
      <EventPublisher />
      <Logger />
      <KeenCharacter
        position={position}
        characterState={characterState}
      />
      <OtherPlayers />
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
