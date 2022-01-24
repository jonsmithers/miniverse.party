import { AnyAction, createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { CharacterState, MovementData, Position } from "../sharedTypes";
import { toRadians } from "../utils";
import { Connection } from "../websocket";

interface State {
  pressedKeys: {
    [index: KeyboardEvent['key']]: true
  };
  userId: number;
  characters: {
    [index: number]: {
      /** radians from north */
      direction: number;
      /** speed in "distance units" per millisecond */
      velocity: number,
      facing: 'left' | 'right';
      state: CharacterState;
      position: Position;
    }
  }
}

export function createEverythingSlice(connection: Connection) {
  const userId = connection.userId;
  const slice = createSlice({
    name: 'everything',
    initialState: (): State => ({
      pressedKeys: {},
      userId: userId,
      characters: {
        [userId]: {
          direction: 90 * (Math.PI / 180),
          facing: 'right',
          velocity: 0,
          state: 'standRight',
          position: [0,0],
        }
      },
    }),
    reducers: {
      tick(state, action: PayloadAction<{ elapsedMillis: number; }>) {
        const { elapsedMillis } = action.payload;
        for (const character of Object.values(state.characters))  {
          const distance = character.velocity * elapsedMillis;
          // negative because y==0 is North
          const yDelta = -Math.cos(character.direction) * distance;
          const xDelta = Math.sin(character.direction) * distance;
          let [x, y] = character.position;
          x += xDelta;
          y += yDelta;
          character.position = [x, y];
        }
      },
      _acceptMovementMessage(state, action: PayloadAction<MovementData & { userId: number }>) {
        state.characters[action.payload.userId] = {
          position: action.payload.position,
          state: action.payload.state,
          velocity: action.payload.velocity,
          direction: action.payload.direction,
          facing: 'right',
        }
      },
      _setUserId(state, action: PayloadAction<number>) {
        state.userId = action.payload;
      },
      _addPressedKey(state, action: PayloadAction<KeyboardEvent['key']>) {
        state.pressedKeys[action.payload] = true;
        setVelocityAndDirectionAccordingToPressedKeys(state);
      },
      _removePressedKey(state, action: PayloadAction<KeyboardEvent['key']>) {
        delete state.pressedKeys[action.payload];
        setVelocityAndDirectionAccordingToPressedKeys(state);
      },
    },
  });
  const { _addPressedKey, _removePressedKey, _setUserId, _acceptMovementMessage, ...publicActions } = slice.actions;

  return {
    reducer: slice.reducer,
    actions: publicActions,
    connectSlice(dispatch: Dispatch<AnyAction>) {
      (() => {
        dispatch(_setUserId(userId));
        const keydownListener = (event: KeyboardEvent) => {
          dispatch(_addPressedKey(event.key));
        };
        const keyupListener = (event: KeyboardEvent) => {
          dispatch(_removePressedKey(event.key));
        };
        window.addEventListener('keydown', keydownListener);
        window.addEventListener('keyup', keyupListener);
      })();
      (() => {
        connection.onMessage(message => {
          switch(message.type) {
            case 'move':
              if (message.userId === connection.userId) {
                return;
              }
              dispatch(_acceptMovementMessage(message));
              return;
            default:
              console.log('unrecognized message', message.type);
          }
          console.log('message', message);
        });
      })();
    }
  }
}



const setVelocityAndDirectionAccordingToPressedKeys = (state: State) => {
  if (typeof state.userId !== 'number') {
    throw new Error('unreachable');
  }
  const { pressedKeys } = state;
  const right = pressedKeys['ArrowRight'] || pressedKeys['d'];
  const left = pressedKeys['ArrowLeft'] || pressedKeys['a'];
  const up = pressedKeys['ArrowUp'] || pressedKeys['w'];
  const down = pressedKeys['ArrowDown'] || pressedKeys['s'];
  const character = state.characters[state.userId];
  const newDirection = (() => {
    if (right && left) {
      return 0;
    }
    if (up && right) {
      return toRadians(45);
    }
    if (right && down) {
      return toRadians(135);
    }
    if (left && down) {
      return toRadians(225);
    }
    if (left && up) {
      return toRadians(315);
    }
    if (left) {
      return toRadians(270);
    }
    if (right) {
      return toRadians(90);
    }
    if (down) {
      return toRadians(180);
    }
    if (up) {
      return toRadians(0);
    }
    return undefined;
  })();
  character.velocity = newDirection === undefined ? 0 : 1/6;
  character.direction = newDirection ?? character.direction;

  if (0 < character.direction && character.direction < toRadians(180)) {
    character.facing = 'right';
  }
  if (toRadians(180) < character.direction && character.direction < toRadians(360)) {
    character.facing = 'left';
  }
  character.state = (() => {
    if (newDirection === undefined) {
      return character.facing === 'right' ? 'standRight' : 'standLeft';
    } else {
      return character.facing === 'right' ? 'runRight' : 'runLeft';
    }
  })();
};
