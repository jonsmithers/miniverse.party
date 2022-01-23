import { configureStore } from "@reduxjs/toolkit";
import { characterReducer } from "./character";
import { createKeyboardSlice } from "./keyboard";
import {
  TypedUseSelectorHook,
  useDispatch as untypedUseDispatch,
  useSelector as untypedUsedSelector,
  useStore as untypedUseStore,
} from 'react-redux';

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
