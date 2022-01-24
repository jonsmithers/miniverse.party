import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CharacterState, Position } from "../sharedTypes";
import { toRadians } from "../utils";

export interface MovementData {
  position: Position;
  direction: number;
  velocity: number;
  state: CharacterState;
  facing: 'left' | 'right';
}
export type Character = {
  positionTimestamp: number;
} & MovementData
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
export const characterReducer = characterSlice.reducer;

