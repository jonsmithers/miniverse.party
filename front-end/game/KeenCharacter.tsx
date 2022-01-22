import { AnimatedSprite, Container, useTick } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { useMemo, useRef, useState } from 'react';
import { useStore } from './GameContextProvider';

const CharacterStates = [
  'runRight',
  'runLeft',
  'standRight',
  'standLeft',
] as const;
type CharacterState = typeof CharacterStates[number];

export const KeenCharacter: React.FC<{
  position: [number, number];
  characterState: CharacterState;
}> = ((props) => {
  const keenSpritesheet = useStore().loader.resources.keen.spritesheet;

  if (keenSpritesheet === undefined) {
    throw new Error('unreachable');
  }

  const spriteMap: {
    [i in CharacterState]: PIXI.Texture<PIXI.Resource>[];
  } = useMemo(() =>
    keenSpritesheet && ({
      runRight: keenSpritesheet.animations['run right '],
      runLeft: keenSpritesheet.animations['run left '],
      standRight: [keenSpritesheet.textures['standing.png']],
      standLeft: [keenSpritesheet.textures['stand left.png']],
    }), [keenSpritesheet]);

  const textures = useMemo(() => spriteMap?.[props.characterState], [
    props.characterState,
    spriteMap,
  ]);

  return (
    <Container position={props.position}>
      {textures && (
        <AnimatedSprite
          key={props.characterState}
          textures={textures}
          isPlaying={true}
          scale={2}
          animationSpeed={0.1}
        />
      )}
    </Container>
  );
});

const VELOCITY_RIGHT = ([x, y]: [number, number], elapsed: number) =>
  [x + elapsed / 6, y] as [number, number];
const VELOCITY_LEFT = ([x, y]: [number, number], elapsed: number) =>
  [x - elapsed / 6, y] as [number, number];
const IDLE = ([x, y]: [number, number], _elapsed: number) =>
  [x, y] as [number, number];

interface TimedPosition {
  position: [number, number];
  timestamp: number;
}
function useMovement(
  initialPosition: [number, number],
  moveFunc: ([x, y]: [number, number], elapsed: number) => [number, number],
) {
  const [timedPosition, setTimedPosition] = useState<TimedPosition>({
    position: initialPosition,
    timestamp: performance.now(),
  });
  const position = timedPosition.position;
  useTick(() => {
    setTimedPosition({
      position: moveFunc(position, performance.now() - timedPosition.timestamp),
      timestamp: performance.now(),
    });
  });
  return [position];
}

export function KeyboardControlPosition(
  props: {
    children(position: [number, number], state: CharacterState): JSX.Element;
  },
): JSX.Element {
  const rightKeyPressed = useStore().keyboardStore.right.isPressed;
  const leftKeyPressed = useStore().keyboardStore.left.isPressed;
  const movementFunc = useMemo(() => {
    if (rightKeyPressed) {
      return VELOCITY_RIGHT;
    } else if (leftKeyPressed) {
      return VELOCITY_LEFT;
    } else {
      return IDLE;
    }
  }, [leftKeyPressed, rightKeyPressed]);
  const characterState = useMemo(() => {
    switch (movementFunc) {
      case VELOCITY_RIGHT:
        return 'runRight';
      case VELOCITY_LEFT:
        return 'runLeft';
      default:
        return 'standRight';
    }
  }, [movementFunc]);
  const [position] = useMovement([0, 0], movementFunc);
  return (
    <>
      {props.children(position, characterState)}
    </>
  );
}

/**
 * @param value - current value
 * @return the value from the previous render (or undefined for first render)
 */
function usePreviousValue<T>(value: T): T | undefined {
  const previousValueRef = useRef<T | undefined>(undefined);
  const previousValue = previousValueRef.current;
  previousValueRef.current = value;
  return previousValue;
}

/**
 * Returns true if this value is different this render from what it was _last_ render.
 *
 * ISSUE: on first render, this returns `(value === undefined)`
 *
 * @param value
 */
export function useHasChanged<T>(value: T): boolean {
  return value !== usePreviousValue(value);
}
