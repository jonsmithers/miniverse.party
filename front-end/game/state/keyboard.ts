import { AnyAction, createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";

export function createKeyboardSlice() {
  const initialState: { [index: KeyboardEvent['key']]: true } = {};

  const slice = createSlice({
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

  return {
    reducer: slice.reducer,
    connect(dispatch: Dispatch<AnyAction>) {
      const keydownListener = (event: KeyboardEvent) => {
        dispatch(slice.actions.add(event.key));
      };
      const keyupListener = (event: KeyboardEvent) => {
        dispatch(slice.actions.remove(event.key));
      };
      window.addEventListener('keydown', keydownListener);
      window.addEventListener('keyup', keyupListener);
    },
  };
}
