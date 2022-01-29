import { AnyAction, createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { CharacterState, MovementData, Position } from "../sharedTypes";
import { toDegrees, toRadians } from "../utils";
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
          if (isNaN(x) || isNaN(y)) {
            console.warn("NaN", { direction: character.direction, distance })
          }
          character.position = [x, y];
        }
      },
      _acceptKickMessage(state, action: PayloadAction<{ userId: number }>) {
        delete state.characters[action.payload.userId];
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
      _setMovingInDirection(state, action: PayloadAction<{ direction: number }>) {
        const character = state.characters[state.userId];
        const direction = action.payload.direction;
        setVelocityAndDirection({ character, direction });
      },
      _setIdle(state) {
        const character = state.characters[state.userId];
        const direction = undefined;
        setVelocityAndDirection({ character, direction });
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
  const {
    _acceptMovementMessage,
    _acceptKickMessage,
    _addPressedKey,
    _removePressedKey,
    _setMovingInDirection,
    _setIdle,
    _setUserId,
    ...publicActions
  } = slice.actions;

  return {
    reducer: slice.reducer,
    actions: publicActions,
    connectSlice(dispatch: Dispatch<AnyAction>) {
      (() => {
        const touchStartListener = (event: TouchEvent)  => {
          // const log = (s: string) => document.body.insertAdjacentHTML('afterbegin', `<div>${s}</div>`);
          if (event.touches.length !== 1) {
            return
          }
          const startX = event.touches[0].screenX;
          const startY = event.touches[0].screenY;
          const controller  = new AbortController();
          const { signal } = controller;
          window.addEventListener('touchmove', (event: TouchEvent) => {
            if (!Array.from(event.changedTouches).map(t => t.identifier).includes(event.touches[0].identifier)) {
              return
            }

            const xDelta = event.touches[0].screenX - startX;
            // negative because y==0 is North
            const yDelta = -(event.touches[0].screenY - startY);
            if (yDelta === 0) {
              return dispatch(_setMovingInDirection({ direction: xDelta > 0 ? toRadians(90) : toRadians(-90) }));
            }
            const direction = Math.atan(xDelta / yDelta) + (yDelta < 0 ? Math.PI : 0);
            dispatch(_setMovingInDirection({ direction }));
          }, { signal });
          window.addEventListener('touchend', (event: TouchEvent) => {
            if (event.touches.length !== 0) {
              return
            }
            controller.abort();
            dispatch(_setIdle());
          }, { signal });
        }
        window.addEventListener('touchstart', touchStartListener);
      })();
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
            case 'kick':
              dispatch(_acceptKickMessage(message));
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

const VELOCITY = 1/6;
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
  const direction = (() => {
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
  setVelocityAndDirection({ direction, character });
};

const setVelocityAndDirection = (arg: { direction: number | undefined, character: State['characters'][number]}) => {
  const { direction: newDirection, character } = arg;

  character.velocity = newDirection === undefined ? 0 : VELOCITY;
  character.direction = newDirection ?? character.direction;

  const directionDegrees = (toDegrees(character.direction) + 360) % 360;

  if (0 < directionDegrees && directionDegrees < 180) {
    character.facing = 'right';
  }
  if (180 < directionDegrees && directionDegrees < 360) {
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
