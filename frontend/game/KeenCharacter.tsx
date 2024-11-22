import { AnimatedSprite, Container } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { useMemo, useRef } from 'react';
import { useValtioStore } from './GameContextProvider';
import { CharacterState } from './sharedTypes';

export const KeenCharacter: React.FC<{
  positionOnScreen: [number, number];
  characterState: CharacterState;
}> = function KeenCharacter(props) {
  const keenSpritesheet = useValtioStore().loader.resources.keen.spritesheet;

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
    <Container position={props.positionOnScreen}>
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
};

export const VELOCITY_RIGHT = ([x, y]: [number, number], elapsed: number) =>
  [x + elapsed / 6, y] as [number, number];
export const VELOCITY_LEFT = ([x, y]: [number, number], elapsed: number) =>
  [x - elapsed / 6, y] as [number, number];
export const IDLE = ([x, y]: [number, number], _elapsed: number) =>
  [x, y] as [number, number];

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
