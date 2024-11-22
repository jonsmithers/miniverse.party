import { configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch as untypedUseDispatch,
  useSelector as untypedUsedSelector,
  useStore as untypedUseStore,
} from 'react-redux';
import { Connection } from "../websocket";
import { createEverythingSlice } from "./everything";

export const createReduxStore = (connection: Connection) => {

  const slice = createEverythingSlice(connection);
  const store = configureStore({
    reducer: {
      everything: slice.reducer,
    },
  });

  slice.connectSlice(store.dispatch);
  return { store, actions: slice.actions };
};

type ReduxStoreState = ReturnType<
  ReturnType<typeof createReduxStore>['store']['getState']
>;
type ReduxStoreDispatch = ReturnType<typeof createReduxStore>['store']['dispatch'];
export const useSelector: TypedUseSelectorHook<ReduxStoreState> = untypedUsedSelector;
export const useDispatch = () => untypedUseDispatch<ReduxStoreDispatch>();
export const useStore = () => untypedUseStore<ReduxStoreState>();
