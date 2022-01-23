import { configureStore } from '@reduxjs/toolkit';
import * as PIXI from 'pixi.js';
import {
  TypedUseSelectorHook,
  useDispatch as untypedUseDispatch,
  useSelector as untypedUsedSelector,
  useStore as untypedUseStore,
} from 'react-redux';
import { proxy, ref } from 'valtio';
import { characterReducer } from './state/character';
import { createKeyboardSlice } from './state/keyboard';
export const createReduxStore = () => {
  const keyboardSlice = createKeyboardSlice();

  const store = configureStore({
    reducer: {
      character: characterReducer,
      keyboard: keyboardSlice.reducer,
    },
  });

  keyboardSlice.connect(store.dispatch);
  return store;
};

type ReduxStoreState = ReturnType<
  ReturnType<typeof createReduxStore>['getState']
>;
type ReduxStoreDispatch = ReturnType<typeof createReduxStore>['dispatch'];
export const useSelector: TypedUseSelectorHook<ReduxStoreState> =
  untypedUsedSelector;
export const useDispatch = () => untypedUseDispatch<ReduxStoreDispatch>();
export const useStore = () => untypedUseStore<ReduxStoreState>();

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
