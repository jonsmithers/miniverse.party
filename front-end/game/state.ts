import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as PIXI from 'pixi.js';
import {
  TypedUseSelectorHook,
  useDispatch as untypedUseDispatch,
  useSelector as untypedUsedSelector,
} from 'react-redux';
import { proxy, ref } from 'valtio';
import { CharacterState, VELOCITY_LEFT, VELOCITY_RIGHT } from './KeenCharacter';

interface Character2 {
  position: Position;
  state: CharacterState;
  positionTimestamp: number;
}
const initialCharacter: Character2 = {
  position: [0, 0],
  state: 'standRight',
  positionTimestamp: performance.now(),
};
const characterSlice = createSlice({
  name: 'character',
  initialState: initialCharacter,
  reducers: {
    move(
      state,
      action: PayloadAction<{ elapsed: number; direction: 'right' | 'left' }>,
    ) {
      const moveFnc = action.payload.direction === 'right'
        ? VELOCITY_RIGHT
        : VELOCITY_LEFT;
      state.state = action.payload.direction === 'right'
        ? 'runRight'
        : 'runLeft';
      state.position = moveFnc(state.position, action.payload.elapsed);
      state.positionTimestamp = performance.now();
    },
    idle(state) {
      switch (state.state) {
        case 'runRight':
          state.state = 'standRight';
          break;
        default:
          state.state = 'standLeft';
          break;
      }
    },
  },
});

export const characterActions = characterSlice.actions;

export const createReduxStore = () => {
  const keyStateSlice = createKeyStateSlice();

  const store = configureStore({
    reducer: {
      character: characterSlice.reducer,
      keystate: keyStateSlice.reducer,
    },
  });
  {
    const keydownListener = (event: KeyboardEvent) => {
      store.dispatch(keyStateSlice.actions.add(event.key));
    };
    const keyupListener = (event: KeyboardEvent) => {
      store.dispatch(keyStateSlice.actions.remove(event.key));
    };
    window.addEventListener('keydown', keydownListener);
    window.addEventListener('keyup', keyupListener);
  }
  return store;
};
type ReduxStoreState = ReturnType<
  ReturnType<typeof createReduxStore>['getState']
>;
type ReduxStoreDispatch = ReturnType<typeof createReduxStore>['dispatch'];
export const useSelector: TypedUseSelectorHook<ReduxStoreState> =
  untypedUsedSelector;
export const useDispatch = () => untypedUseDispatch<ReduxStoreDispatch>();

function createKeyStateSlice() {
  const initialState: { [index: KeyboardEvent['key']]: true } = {};
  return createSlice({
    name: 'pressed-keys',
    initialState,
    reducers: {
      add(state, action: PayloadAction<KeyboardEvent['key']>) {
        state[action.payload] = true;
      },
      remove(state, action: PayloadAction<KeyboardEvent['key']>) {
        delete state[action.payload];
      },
    },
  });
}

export class RootStore {
  loader = createLoader();
  static create() {
    return proxy(new RootStore());
  }
  private constructor() {}
}

/**
 * [x, y]
 *
 * Top-left is [0,0]. So x++ moves right, and y++
 * moves down.
 */
export type Position = [number, number];

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
