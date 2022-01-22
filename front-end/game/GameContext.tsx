import * as PIXI from 'pixi.js';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { makeAutoObservable } from 'mobx';
import { useMakeOnce } from './utils';

export class RootStore {
  loader: PIXI.Loader | 'still loading';
  character: Character;
  constructor() {
    makeAutoObservable(this);
    this.loader = 'still loading';
    this.character = new Character();
  }
  get myCharacter() {
    return this.character;
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
  const rootStore = useMakeOnce(() => new RootStore());

  // TODO move this into constructor of RootStore
  // TODO maybe render Suspense when loader is not present
  useEffect(() => {
    createLoader().then((loader) => {
      rootStore.loader = loader;
    });
  }, [rootStore]);

  return (
    <gameContext.Provider value={{ rootStore }}>
      {props.children}
    </gameContext.Provider>
  );
};

function createLoader(): Promise<PIXI.Loader> {
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
  return resourceLoadPromise;
}
