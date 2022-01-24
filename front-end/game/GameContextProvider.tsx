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
  actions: ReturnType<typeof createReduxStore>['actions'];
}
const gameContext = createContext<GameContext>('jk' as unknown as GameContext);
export const useGameContext = (): GameContext => {
  return useContext(gameContext);
};
export const useValtioStore = (): DeepResolveType<ValtioRootStore> => {
  return useSnapshot(useGameContext().rootStore);
};

export const GameContextProvider: React.FC = (props) => {
  const connection = useMakeOnce(() => Connection.openNew());
  const { store, actions } = useMakeOnce(() => createReduxStore(connection));
  return (
    <Provider store={store}>
      <gameContext.Provider
        value={useMakeOnce(() => ({
          rootStore: ValtioRootStore.create(),
          connection,
          actions,
        }))}
      >
        {props.children}
      </gameContext.Provider>
    </Provider>
  );
};
