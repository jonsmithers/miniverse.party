import * as PIXI from 'pixi.js';

import { proxy, ref } from 'valtio';

export class ValtioRootStore {
  loader = createLoader();
  static create() {
    return proxy(new ValtioRootStore());
  }
  private constructor() {}
}

async function createLoader() {
  const loader: PIXI.Loader = new PIXI.Loader();
  loader.add('keen', '/game-assets/keen.json');
  loader.add('gotMap', '/game-assets/Agot_hbo_guide_map.jpeg');
  loader.load((_, resources) => {
    console.log('resources', resources);
  });
  const loadedLoader = await new Promise<PIXI.Loader>((resolve, reject) => {
    loader.onComplete.add(resolve);
    loader.onError.add(reject);
  });
  return ref(loadedLoader);
}
