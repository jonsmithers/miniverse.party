import { createContext, useContext } from 'react';
import { useMakeOnce } from './utils';
import { useSnapshot } from 'valtio';
import { DeepResolveType } from 'valtio/vanilla';
import { RootStore } from './state';

export interface GameContext {
  rootStore: RootStore;
}
const gameContext = createContext<GameContext>('jk' as unknown as GameContext);
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
