import * as PIXI from 'pixi.js';
import { createContext, useContext } from 'react';
import { useMakeOnce } from './utils';
import { proxy, ref, useSnapshot } from 'valtio';
import { DeepResolveType } from 'valtio/vanilla';

export class RootStore {
  character: Character = Character.create();
  loader = createLoader();
  keyboardStore = proxy({
    right: KeyState.create('ArrowRight'),
    left: KeyState.create('ArrowLeft'),
  });
  static create() {
    return proxy(new RootStore());
  }
  private constructor() {}
}

class KeyState {
  isPressed = false;
  static create(name: string) {
    const newKeyState = proxy(new KeyState());
    const keydownListener = (event: KeyboardEvent) => {
      if (event.key === name) {
        newKeyState.isPressed = true;
      }
    };
    const keyupListener = (event: KeyboardEvent) => {
      if (event.key === name) {
        newKeyState.isPressed = false;
      }
    };
    window.addEventListener('keydown', keydownListener);
    window.addEventListener('keyup', keyupListener);
    return newKeyState;
  }
  private constructor() {}
}

class Character {
  static create() {
    return proxy(new Character());
  }
  private constructor() {
  }
  dispose() {
    throw new Error('not implemented');
  }
}

export interface GameContext {
  rootStore: RootStore;
}
const gameContext = createContext<GameContext>('what' as any);
export const useGameContext = (): GameContext => {
  return useContext(gameContext);
};
export const useStore = (): DeepResolveType<RootStore> => {
  return useSnapshot(useGameContext().rootStore);
};

export const GameContextProvider: React.FC = (props) => {
  const rootStore = useMakeOnce(() => RootStore.create());

  return (
    <gameContext.Provider value={{ rootStore }}>
      {props.children}
    </gameContext.Provider>
  );
};

function createLoader() {
  const loader: PIXI.Loader = new PIXI.Loader();
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
  return resourceLoadPromise.then((loader) => ref(loader));
}
