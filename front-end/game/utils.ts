import { useTick } from '@inlet/react-pixi';
import { useEffect, useState } from 'react';

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
