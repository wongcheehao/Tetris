export type {State, Action, Key, Event, TetrisPiece };

/**
 * Game state
 */
type State = Readonly<{
    game: number[][];  // game grid 
    xOffset: number; // x offset of the current Tetris piece
    yOffset: number; // y offset of the current Tetris piece
    currTetris: TetrisPiece; // current tetris piece
    nextTetris: TetrisPiece; // next tetris piece
    gameEnd: boolean; // true if game over
    gameLevel: number; // game level of the current game
    highScore: number; // highest score
    score: number;// score of the game
    rowCleared: number; // track number of row cleared, for game level update purpose
    totalRowCleared: number; // track total number of row cleared
    powerUpLeft: number; // track number of power-up left
    debuffTime: number; // track debuff happen time
    tickCount: number; // count the number of emit by tick obeservable
    tickCountThreshold: number; // for controlling the speed of tetris
  }>;

/**
 * Each tetris piece is a 2D array
 */
type TetrisPiece =  number[][];  // tetris representation in 2D array;
;

/**
 * Actions modify state
 */
interface Action {
    apply(s: State): State;
  }


/** User input */

type Key = "ArrowLeft" | "ArrowRight" | "ArrowDown" | "ArrowUp" | "Space" | "Enter";

type Event = "keydown" | "keyup" | "keypress";

