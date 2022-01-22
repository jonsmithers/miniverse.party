import * as PIXI from 'pixi.js';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useMakeOnce } from './utils';
import { proxy, ref } from 'valtio';

export class RootStore {
  character: Character = new Character();
  loader = createLoader();
  static create() {
    return proxy(new RootStore());
  }
  private constructor() {
  }
}

class Character {
}

export interface GameContext {
  rootStore: RootStore;
}
const gameContext = createContext<GameContext>('what' as any);
export const useGameContext = (): GameContext => {
  return useContext(gameContext);
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
