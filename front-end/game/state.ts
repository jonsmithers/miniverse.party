import * as PIXI from 'pixi.js';
import { proxy, ref } from 'valtio';
import { Connection } from './websocket';

export class RootStore {
  character: Character = Character.create();
  loader = createLoader();
  keyboardStore = proxy({
    right: KeyState.create('ArrowRight'),
    left: KeyState.create('ArrowLeft'),
  });
  connection = Connection.openNew();
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

async function createLoader() {
  const loader: PIXI.Loader = new PIXI.Loader();
  loader.add('keen', '/game-assets/keen.json');
  loader.load((_, resources) => {
    console.log('resources', resources);
  });
  const loadedLoader = await new Promise<PIXI.Loader>((resolve, reject) => {
    loader.onComplete.add(resolve);
    loader.onError.add(reject);
  });
  return ref(loadedLoader);
}
