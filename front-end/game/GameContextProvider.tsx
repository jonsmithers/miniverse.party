import { createContext, useContext } from 'react';
import { useMakeOnce } from './utils';
import { useSnapshot } from 'valtio';
import { DeepResolveType } from 'valtio/vanilla';
import { Provider } from 'react-redux';
import { Connection } from './websocket';
import { createReduxStore } from './state/rootStore';
import { ValtioRootStore } from './state/valtioRoot';

export interface GameContext {
  rootStore: ValtioRootStore;
  connection: Connection;
}
const gameContext = createContext<GameContext>('jk' as unknown as GameContext);
export const useGameContext = (): GameContext => {
  return useContext(gameContext);
};
export const useValtioStore = (): DeepResolveType<ValtioRootStore> => {
  return useSnapshot(useGameContext().rootStore);
};

export const GameContextProvider: React.FC = (props) => {
  return (
    <Provider store={useMakeOnce(() => createReduxStore())}>
      <gameContext.Provider
        value={useMakeOnce(() => ({
          rootStore: ValtioRootStore.create(),
          connection: Connection.openNew(),
        }))}
      >
        {props.children}
      </gameContext.Provider>
    </Provider>
  );
};
