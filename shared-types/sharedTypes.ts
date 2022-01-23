export type Message = {
  userId: number;
} & ({
  type: 'move';
  position: Position;
  /** radians from north */
  direction: number;
  /** distance units per millisecond */
  velocity: number;
} | {
  type: 'nonsense';
})

/**
 * [x, y]
 *
 * Top-left is [0,0]. So x++ moves right, and y++
 * moves down.
 */
export type Position = [number, number];
