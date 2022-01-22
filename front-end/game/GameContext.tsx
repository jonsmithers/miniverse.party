import * as PIXI from 'pixi.js';
import { createContext, useContext } from 'react';
import { useMakeOnce } from './utils';
import { proxy, ref, useSnapshot } from 'valtio';
import { DeepResolveType } from 'valtio/vanilla';
import { RootStore } from './state';

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
