import { createContext, useContext } from 'react';
import { useMakeOnce } from './utils';
import { useSnapshot } from 'valtio';
import { DeepResolveType } from 'valtio/vanilla';
import { createReduxStore, RootStore } from './state';
import { Provider } from 'react-redux';
import { Connection } from './websocket';

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
  return (
    <Provider store={useMakeOnce(() => createReduxStore())}>
      <gameContext.Provider
        value={useMakeOnce(() => ({
          rootStore: RootStore.create(),
          connection: Connection.openNew(),
        }))}
      >
        {props.children}
      </gameContext.Provider>
    </Provider>
  );
};
