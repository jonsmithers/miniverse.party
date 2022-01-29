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

export type Message = MessageWithoutUserId & {
  userId: number;
};

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
