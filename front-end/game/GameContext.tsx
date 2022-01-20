import * as PIXI from 'pixi.js'
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface GameContext {
  loader: PIXI.Loader | 'still loading';
  userId: number;
  stage: {
    characters: {
      x: number;
      y: number;
      /** in degrees from North? */
      direction: number;
      velocity: number;
    }[];
  }
}
const gameContext = createContext<GameContext>('what' as any);
export const useGameContext = (): GameContext => {
  return useContext(gameContext);
}

export const GameContextProvider: React.FC = (props) => {
  const [gameState, setGameState] = useState<GameContext>(() => ({
    loader: 'still loading',
    userId: Math.random(),
    stage: {
      characters: [{
        x: 20,
        y: 0,
        /** in degrees from North? */
        direction: 0,
        velocity: 0,
      }]},
  }));

  useEffect(() => {
    createLoader().then(loader => setGameState(old => ({...old, loader })));
  }, []);

  return (
    <gameContext.Provider value={gameState}>
      {props.children}
    </gameContext.Provider>
  );
};

export const MyTest: React.FC = () => {
  console.log('mytest', useGameContext());
  return (<></>);
}

function createLoader(): Promise<PIXI.Loader> {
  const loader: PIXI.Loader = new PIXI.Loader()
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

function useLoader(): GameContext['loader'] {
  const [maybeLoader, setLoader] = useState<GameContext['loader']>(() => {
    const loader: PIXI.Loader = new PIXI.Loader()
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
    resourceLoadPromise.then(x => setLoader(x));
    return 'still loading' as const;
  });
  console.log('maybeLoader', maybeLoader);
  return maybeLoader;
}
