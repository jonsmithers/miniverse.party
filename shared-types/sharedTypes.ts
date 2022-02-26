type MessageWithoutUserId =
  | ({
    type: 'move';
  } & MovementData)
  | {
    type: 'kick';
  }
  | {
    type: 'nonsense';
    because: 'this' | 'type';
    has: ['a', 'different', 'payload'];
  }
  | {
    type: 'other message type';
    andSo: 'does this one';
  };

export type Message =
  | MessageWithoutUserId & {
    userId: UserId;
  }
  | {
    type: 'hydrate';
    roomState: RoomState;
  };

export interface RoomState {
  players: {
    [user: UserId]: {
      movementData: MovementData;
    };
  };
}
export type UserId = number;
export type RoomNumber = number;

export class RoomStateMutator {
  roomState: RoomState = { players: {} };
  applyEvent(message: Message) {
    switch (message.type) {
      case 'move':
        this.roomState.players[message.userId] ??= { movementData: message };
        this.roomState.players[message.userId].movementData = message;
        break;
      case 'kick':
        delete this.roomState.players[message.userId];
        break;
    }
  }
  isEmpty() {
    return !Object.keys(this.roomState.players).length;
  }
}

export interface MovementData {
  position: Position;
  /** radians from north */
  direction: number;
  /** distance units per millisecond */
  velocity: number;
  state: CharacterState;
}

export const CharacterStates = [
  'runRight',
  'runLeft',
  'standRight',
  'standLeft',
] as const;
export type CharacterState = typeof CharacterStates[number];

/**
 * [x, y]
 *
 * Top-left is [0,0]. So x++ moves right, and y++
 * moves down.
 */
export type Position = [number, number];
