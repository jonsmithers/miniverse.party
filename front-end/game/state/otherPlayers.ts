import { AnyAction, createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "../sharedTypes";
import { Connection } from "../websocket";
import { Character, MovementData } from "./character";

export function createOtherPlayersSlice(connection: Connection) {
  console.log('connection', connection);
  const initialState: {
    messageBuffer: Message[];
    characters: { [index: number]: Character };
  } = {
    messageBuffer: [],
    characters: { },
  };

  const slice = createSlice({
    name: 'otherPlayers',
    initialState,
    reducers: {
      updateCharacter(state, action: PayloadAction<MovementData & { userId: number }>) {
        const { userId, velocity, direction, position, facing, state: characterState } = action.payload;
        state.characters[userId] = {
          velocity,
          direction,
          facing,
          state: characterState,
          position,
          positionTimestamp: performance.now(),
        }
      }
    },
  });

  return {
    reducer: slice.reducer,
    connect(dispatch: Dispatch<AnyAction>) {
      connection.onMessage(message => {
        switch(message.type) {
          case 'move':
            dispatch(slice.actions.updateCharacter(message));
            return;
          default:
            console.log('unrecognized message', message.type);
        }
        console.log('message', message);
      });
      console.log('need connecction here', dispatch);
    },
  };
}
