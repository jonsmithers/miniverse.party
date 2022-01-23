import * as PIXI from 'pixi.js';

import { proxy, ref } from 'valtio';

export class RootStore {
  loader = createLoader();
  static create() {
    return proxy(new RootStore());
  }
  private constructor() {}
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
