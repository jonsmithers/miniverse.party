import { useTick } from '@inlet/react-pixi';
import { useEffect, useRef, useState } from 'react';
import { Position } from './sharedTypes';

/**
 * @return - speculated value
 */
export function useSpeculation<T>(
  baseValue: T,
  speculate: (baseValue: T, millisElapsed: number) => T,
): T {
  const [state, setState] = useState<InternalState<T>>(() => ({
    speculatedValue: baseValue,
    baseValue,
    baseTimestamp: performance.now(),
  }));

  useEffect(() => {
    setState({
      speculatedValue: baseValue,
      baseValue,
      baseTimestamp: performance.now(),
    });
  }, [baseValue]);

  useEffect(() => {
    setState((old) => ({
      ...old,
      baseValue: old.speculatedValue,
    }));
  }, [speculate]);

  useTick(() => {
    setState((old) => ({
      ...old,
      speculatedValue: speculate(
        old.baseValue,
        performance.now() - old.baseTimestamp,
      ),
    }));
  });

  return state.speculatedValue;
}
interface InternalState<T> {
  speculatedValue: T;
  baseValue: T;
  baseTimestamp: number;
}

export function useKeyState(name: KeyboardEvent['key']): boolean {
  const [isPressed, setIsPressed] = useState(false);
  useEffect(() => {
    function keydownListener(event: KeyboardEvent) {
      if (event.key === name) {
        setIsPressed(true);
      }
    }
    function keyupListener(event: KeyboardEvent) {
      if (event.key === name) {
        setIsPressed(false);
      }
    }
    window.addEventListener('keydown', keydownListener);
    window.addEventListener('keyup', keyupListener);
    return () => {
      window.removeEventListener('keydown', keydownListener);
      window.removeEventListener('keyup', keyupListener);
    };
  }, [name]);
  return isPressed;
}

export function useMakeOnce<T>(factory: () => T): T {
  const t = useRef<T>();
  t.current = t.current ?? factory();
  return t.current;
}

const TO_RADIANS = Math.PI / 180;
export function toRadians(degrees: number) {
  return degrees * TO_RADIANS;
}
export function toDegrees(radians: number) {
  return radians / TO_RADIANS;
}

export function getPositionOnScreen(arg: {
  cameraPositionOnMap: Position;
  positionOnMap: Position;
  screenHeight: number;
  screenWidth: number;
}): Position {
  const { cameraPositionOnMap, positionOnMap, screenHeight, screenWidth } = arg;
  console.log({
    cameraPositionOnMap,
    positionOnMap,
    screenHeight,
    screenWidth,
  });
  const [cameraX, cameraY] = cameraPositionOnMap;
  const [xOnMap, yOnMap] = positionOnMap;
  return [
    xOnMap - cameraX + (screenWidth / 2),
    yOnMap - cameraY + (screenHeight / 2),
  ];
}
