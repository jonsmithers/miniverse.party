import { Sprite, Stage, Text, useApp, useTick } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import React from 'react';
import { Suspense, useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import {
  GameContextProvider,
  useGameContext,
  useValtioStore,
} from './GameContextProvider';
import { KeenCharacter } from './KeenCharacter';
import { Position } from './sharedTypes';
import { useDispatch, useSelector } from './state/rootStore';
import { getPositionOnScreen } from './utils';

export default function ComponentWrapper() {
  const { width, height, ref } = useResizeDetector();
  return (
    <div
      ref={ref}
      style={{
        overflow: 'hidden',
        width: 800,
        height: 600,
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      <Stage
        height={height}
        width={width}
        options={{ backgroundColor: 0xeef1f5 }}
      >
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
    </div>
  );
}

function EventPublisher() {
  const { connection } = useGameContext();
  const myCharacter = useSelector((store) =>
    store.everything.characters[store.everything.userId]
  );
  const { velocity, direction, state, positionOnMap } = myCharacter;

  const positionRef = useRef(positionOnMap);
  positionRef.current = positionOnMap;

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

function useGetPositionOnScreen(): (positionOnMap: Position) => Position {
  const app = useApp();
  const screenWidth = app.screen.width;
  const screenHeight = app.screen.height;
  const cameraPositionOnMap = useSelector((store) =>
    store.everything.userCameraPositionOnMap
  );
  return (positionOnMap) => {
    return getPositionOnScreen({
      cameraPositionOnMap,
      positionOnMap,
      screenWidth,
      screenHeight,
    });
  };
}

function Characters() {
  const getPositionOnScreen = useGetPositionOnScreen();
  const characters = useSelector((store) => store.everything.characters);
  return (
    <>
      {Object.entries(characters).map(([userId, character]) => (
        <KeenCharacter
          key={userId}
          characterState={character.state}
          positionOnScreen={getPositionOnScreen(character.positionOnMap)}
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
  const getPositionOnScreen = useGetPositionOnScreen();
  const gotMap = useValtioStore().loader.resources.gotMap;
  return (
    <>
      <Sprite
        texture={gotMap.texture}
        position={getPositionOnScreen([300, -500])}
      />
      <EventPublisher />
      <Characters />
      <Ticker />
      <Text
        text='Hello World'
        anchor={0.5}
        position={getPositionOnScreen([150, 150])}
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
