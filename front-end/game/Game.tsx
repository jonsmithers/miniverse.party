import { Stage, Text, useTick } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { Suspense } from 'react';
import { GameContextProvider } from './GameContextProvider';
import { KeenCharacter } from './KeenCharacter';
import { characterActions, useDispatch, useSelector } from './state';

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

function Game() {
  const position = useSelector((state) => state.character.position);
  const characterState = useSelector((state) => state.character.state);
  const keystate = useSelector((state) => state.keystate);
  const dispatch = useDispatch();
  useTick((_, { elapsedMS: elapsed }) => {
    if (keystate['ArrowRight']) {
      dispatch(characterActions.move({ direction: 'right', elapsed }));
    } else if (keystate['ArrowLeft']) {
      dispatch(characterActions.move({ direction: 'left', elapsed }));
    } else {
      dispatch(characterActions.idle());
    }
  });
  return (
    <>
      <KeenCharacter
        position={position}
        characterState={characterState}
      />
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
