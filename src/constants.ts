export {Viewport, Constants, BlockConstants, AllTetrisPieces}

/** Constants */
const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 120,
    PREVIEW_X: 1,
    PREVIEW_Y: 3
  } as const;
  
const Constants = {
    DEFAULT_TICK_RATE_MS: 10,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,
    EMPTY_TETRIS: 0,
    TETRIS: 1,
    DEFAULT_GAME_LEVEL: 1,
    INITIAL_POWER_UP: 3,
    ADD_POWER_UP_THRESHOLD: 4,
    DEBUFF_TIME_INTERVAL: 20,
    DEBUFF_TICK: 1000,
    DEFAULT_TICK_COUNT_THRESHOLD: 80,
    INITIAL_SCORE: 0,
    INITIAL_HIGH_SCORE: 0,
    INITIAL_ROW_CLEARED: 0,
    INITIAL_TICK_COUNT: 0,
    LEVEL_UP_ROW_CLEARED_THRESHOLD: 10
  } as const;
  
const BlockConstants = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
    INITIAL_X: 0,
    INITIAL_Y: Constants.GRID_WIDTH / 2 - 1,
    MOVE_Y: 1,
    MOVE_X: 1
  } as const;

/**
 * All Possible Tetris Pieces (O, I, J, L, T, S, and Z )
 */
const AllTetrisPieces = [
    [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
    ],
    
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
      
    [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0]
    ],
    
    [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 0]
    ],
    
    [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0]
    ],
    
    [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
    ],
    
    [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
    ]
];
