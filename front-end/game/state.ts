import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as PIXI from 'pixi.js';
import {
  TypedUseSelectorHook,
  useDispatch as untypedUseDispatch,
  useSelector as untypedUsedSelector,
  useStore as untypedUseStore,
} from 'react-redux';
import { proxy, ref } from 'valtio';
import { CharacterState } from './KeenCharacter';
import { Position } from './sharedTypes';
import { createKeyboardSlice } from './state/keyboard';
import { toRadians } from './utils';

interface Character {
  position: Position;
  state: CharacterState;
  facing: 'left' | 'right';
  direction: number;
  velocity: number;
  positionTimestamp: number;
}
const initialCharacter: Character = {
  position: [0, 0],
  state: 'standRight',
  /** radians from north */
  direction: 90 * (Math.PI / 180),
  facing: 'right',
  /** distance units per millisecond */
  velocity: 0,
  positionTimestamp: performance.now(),
};
const characterSlice = createSlice({
  name: 'character',
  initialState: initialCharacter,
  reducers: {
    move(
      state,
      action: PayloadAction<{ elapsed: number; direction: number }>,
    ) {
      const { direction, elapsed } = action.payload;
      state.direction = direction;
      if (0 < state.direction && state.direction < toRadians(180)) {
        state.facing = 'right';
      } else if (
        toRadians(180) < state.direction && state.direction < toRadians(360)
      ) {
        state.facing = 'left';
      }
      state.state = state.facing === 'right' ? 'runRight' : 'runLeft';
      state.velocity = 1 / 6;
      const distance = state.velocity * elapsed;
      // negative because y==0 is North
      const yDelta = -Math.cos(state.direction) * distance;
      const xDelta = Math.sin(state.direction) * distance;
      let [x, y] = state.position;
      x += xDelta;
      y += yDelta;
      state.position = [x, y];
      state.positionTimestamp = performance.now();
    },
    idle(state) {
      state.velocity = 0;
      state.state = state.facing === 'right' ? 'standRight' : 'standLeft';
    },
  },
});

export const characterActions = characterSlice.actions;

export const createReduxStore = () => {
  const keyboardSlice = createKeyboardSlice();

  const store = configureStore({
    reducer: {
      character: characterSlice.reducer,
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
