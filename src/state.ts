export { initialState, reduceState, Tick, MoveLeft, MoveRight, Restart, MoveDown, ClearLastRow, DeBuff, Rotate};
import {State, Action, TetrisPiece} from "./types"
import { Constants,BlockConstants,Viewport } from "./constants";
import { randomGenerateTetris, deleteEmptyRow, createEmptyRows, createEmptyGameGrid, calculateGameScoreIncrease, 
        calculateDebuffTimeIncrease, calculatePowerUpIncrease, emptyTetris} from "./util";

/**
 * Initial State of the game
 */
const initialState: State = {
    game: createEmptyGameGrid(),
    xOffset: BlockConstants.INITIAL_X,  
    yOffset: BlockConstants.INITIAL_Y,  
    currTetris: randomGenerateTetris(),
    nextTetris: randomGenerateTetris(),
    gameEnd: false,
    gameLevel: Constants.DEFAULT_GAME_LEVEL,
    highScore: Constants.INITIAL_HIGH_SCORE,
    score: Constants.INITIAL_SCORE,
    rowCleared: Constants.INITIAL_ROW_CLEARED,
    totalRowCleared: Constants.INITIAL_ROW_CLEARED,
    powerUpLeft: Constants.INITIAL_POWER_UP,
    debuffTime: Constants.DEBUFF_TIME_INTERVAL,
    tickCount: Constants.INITIAL_TICK_COUNT,
    tickCountThreshold: Constants.DEFAULT_TICK_COUNT_THRESHOLD
} as const;

/**
 * state transducer
 * @param s input State
 * @param action type of action to apply to the State
 * @returns a new State 
 */
const reduceState = (s: State, action: Action) => {
    return action.apply(s);
};

/**
 * Class Tick
 */
class Tick implements Action {
    constructor(public readonly elapsed: number) { }
    /** 
     * interval tick: Handle Tetris descending
     * @see updateGame
     * @param s old State
     * @returns new State
     */
    apply(s:State): State { 
        // Use newTickCountThreshold to control the speed of Tetris
        const newTickCountThreshold = Constants.DEFAULT_TICK_COUNT_THRESHOLD / s.gameLevel

        // When In Game
        if(!s.gameEnd){ 
            
            // Update Game and Reset tickCount, if achieve newTickCountThreshold
            if(s.tickCount >= newTickCountThreshold){
                return updateGame({
                    ...s,
                    tickCount: Constants.INITIAL_TICK_COUNT
                });
            }
            // Simply increment tickCount if not achieve newTickCountThreshold
            return {
                ...s,
                tickCount: s.tickCount + 1
            }
        }

        // When Game Over
        return s; 
    }
}

/**
 * Class DeBuff
 */
class DeBuff implements Action {
    constructor() {}
    /** 
     * Game Level increase when debuffTime becomes 0, which can be delayed by clearing rows.
     * @see debuffTime
     * 
     * @param s old State
     * @returns new State
     */
    apply(s:State): State {  
        // When In Game
        if(!s.gameEnd){    
            return {
                ...s,

                // Update gameLevel if debuffTime is 0
                gameLevel: (s.debuffTime - 1) > 0 ? s.gameLevel : s.gameLevel + 1, 

                // Update debuffTime
                debuffTime: (s.debuffTime - 1) > 0 ? s.debuffTime - 1 : Constants.DEBUFF_TIME_INTERVAL
            };
        }

        // When Game Over
        return s; 
    }
}



/**
 * Used to handle the descending of Tetris
 * @param s input State
 * @returns a new State 
 */
const updateGame = (state: State):State =>{
    // If the tetris at the bottom of grid OR is going to collide with other tetris
    if(isOnBottom(state) || (isGoingToCollideWithOtherTetris(state))){
        return handlePlaceTetris(state);
    }
    
    // Simply add the x coordinate to perform descending
    else{
        return{
            ...state,
            xOffset: state.xOffset + 1
        }
    }
}

/**
 * Function to check whether the tetris reach the bottom of the game grid
 * @param state input state
 * @returns true if tetris on the bottom of the game grid
 */
const isOnBottom = (state: State):boolean =>{
    return state.xOffset + deleteEmptyRow(state.currTetris).length > Constants.GRID_HEIGHT - 1;}

/**
 * Function to check whether a given row is full
 * @param row number row
 * @returns true if the row is full 
 */
const isFullRow = (row: number[]): boolean => {
    return row.every(column => column === Constants.TETRIS)
}

/**
 * Function to check whether a given row is full
 * @param row number row
 * @returns true if the row is full 
 */
const handleFullRow = (state:State, gameGrid: number[][]): State => {
    // Copy all values from original grid
    const newGameGrid = [...gameGrid];

    // Create an empty number array to store index of each full row
    const fullRowIndices: number[] = [];
    
    // Save all full row index into an array
    newGameGrid.forEach((row, rowIndex) => {
        if (isFullRow(row)) {
        fullRowIndices.push(rowIndex);
        }
    });

    // Remove each full row from the grid
    if (fullRowIndices.length > 0) {    
        fullRowIndices.reverse().forEach(rowIndex => {
            newGameGrid.splice(rowIndex, 1); 
        });
    }
    
    // Create separate empty row arrays for each cleared row
    const emptyRows = createEmptyRows(fullRowIndices.length);

    // Add empty rows to the top of the game grid
    const updatedGameGrid = [...emptyRows, ...newGameGrid];

    // Calculate rowCleared to handle difficulty(level) increase
    const updatedRowCleared = state.rowCleared + fullRowIndices.length;

    // difficulty(level) increase
    const s = handleDifficultyIncrease({
        ...state,
        rowCleared: updatedRowCleared
    })

    return{
        ...s,
        game: updatedGameGrid,
        // update score based on number of row cleared
        score: s.score + calculateGameScoreIncrease(fullRowIndices.length), 
        // compare and update highest score
        highScore: s.score + fullRowIndices.length > s.highScore ? s.score + fullRowIndices.length : s.highScore, 
        // accumulate total row cleared
        totalRowCleared: s.totalRowCleared + fullRowIndices.length, 
        // add power-up quota if clear more than a certain amount of rows at the same time
        powerUpLeft: s.powerUpLeft + calculatePowerUpIncrease(fullRowIndices.length),
        // delay debuff time according to number of rows cleared
        debuffTime: s.debuffTime + calculateDebuffTimeIncrease(fullRowIndices.length)
    }
}

/*
 * Function to handle diffculty(level) increase
 * @param state input state
 * @returns new state
 */
const handleDifficultyIncrease = (state: State):State =>{
    // if rowCleared reach the threshold for level up
    if(state.rowCleared >= Constants.LEVEL_UP_ROW_CLEARED_THRESHOLD){ 
        return{
            ...state,
            gameLevel: state.gameLevel + Math.floor(state.rowCleared / Constants.LEVEL_UP_ROW_CLEARED_THRESHOLD), // update game level
            rowCleared: state.rowCleared - Constants.LEVEL_UP_ROW_CLEARED_THRESHOLD // reset the rowCleared
        }
    }

    //  if rowCleared not reach the threshold, nothing modified
    return state
}

/*
 * Function to update game grid when tetris placed
 * @param state input state
 * @param gameGrid old game grid
 * @returns new game grid
 */
const placeTetrisUpdateGrid = (state: State, gameGrid: number[][]): number[][] => {
    deleteEmptyRow(state.currTetris).forEach((row: number[], row_index: number) =>
    row.forEach(
    (column, column_index) =>
        { 
            if (column) {
                const updatedRow = row_index + state.xOffset;
                const updatedColumn = column_index + state.yOffset; 
                if (gameGrid[updatedRow]) {
                    gameGrid[updatedRow][updatedColumn] = Constants.TETRIS;
                }
            }
        }
        )
    );
    return gameGrid;
}


/**
 * Function to check whether game over (when at least one column of blocks stack to the top of the grid)
 * @param input state
 * @returns true if the current game is over
 */
const isGameOver = (state: State): boolean => {
    // Check if any block is present in the top row
    return state.game[0].some(column => column === Constants.TETRIS);
}

/**
 * Function to handle place tetris
 * @param input state
 * @returns new state after tetris placed
 */
const handlePlaceTetris = (state: State): State =>{

    // Copy all the values from the current game state into the new game grid
    const newGameGrid = [...state.game];

    // Update the game grid
    const updatedPlaceTetrisGrid = placeTetrisUpdateGrid(state, newGameGrid)

    // Handle Full Row
    const s = handleFullRow(state, updatedPlaceTetrisGrid);

    return { 
        ... s,
        currTetris: s.nextTetris, // next tetris is the preview tetris
        nextTetris: randomGenerateTetris(), // random generate preview tetris
        xOffset: BlockConstants.INITIAL_X, // reset offset
        yOffset: BlockConstants.INITIAL_Y, // reset offset
        gameEnd: isGameOver(s) // check game over after tetris placed
    }
}


/**
 * Function to check if the tetris is going to collide with other tetris
 * @param input state
 * @returns boolean true if the tetris is going to collide with other tetris
 */
const isGoingToCollideWithOtherTetris = (state:State):boolean =>{
    return (
        deleteEmptyRow(state.currTetris).some((row, row_index) =>
            row.some((column, column_index) =>
                column === Constants.EMPTY_TETRIS
                    ? false
                    : state.game[row_index + state.xOffset + 1][column_index + state.yOffset] === Constants.TETRIS
            )
        ) 
    );
};

/**
 * Class MoveLeft
 */
class MoveLeft implements Action{
    constructor(public readonly y:number) {} 
    /**
     * Handle Tetris Move Left
     */
    apply(s:State):State {
    
    if(AllowedToMoveLeft(s)){
        return {...s,
        yOffset: s.yOffset + this.y // Update the y offset 
        }
    }else
        return {...s}  
    }
}

/**
 * Function to check if the tetris is allowed to move left
 * @param input state
 * @returns true if tetris is allowed to move left
 */
const AllowedToMoveLeft = (s:State):boolean => {
    // True if tetris move within left boundary
    const withinLeftBoundary = (s.yOffset + (AllColumnIsEmpty(deleteEmptyRow(s.currTetris), 0) ? 1 : 0)) > 0 ;
    
    // True if going to collide with other tetris
    const collision = deleteEmptyRow(s.currTetris).some((row, row_index) =>
        row.some((column, column_index) => {
            const updatedRow = row_index + s.xOffset;
            const updatedColumn = column_index + s.yOffset - 1;

            // Check row bounds and column bounds
            if (
                updatedRow >= Constants.EMPTY_TETRIS &&
                updatedRow < Constants.GRID_HEIGHT &&
                updatedColumn >= Constants.EMPTY_TETRIS &&
                updatedColumn < Constants.GRID_WIDTH
            ) {
                // Check for collision with existing block
                return column === Constants.TETRIS && s.game[updatedRow][updatedColumn] === Constants.TETRIS;
            }

            // If the indices are out of bounds, no collision
            return false;
        }))

    // Return true if within grid and no collision
    return withinLeftBoundary && !collision;
}

/**
 * Function to check if the certain column of the tetris is empty
 * @param tetris input tetris
 * @param column column to check
 * @returns true if the certain column of the tetris is empty
 */
const AllColumnIsEmpty = (tetris: TetrisPiece, column: number) => {
    return tetris.every(e => e[column] === Constants.EMPTY_TETRIS) 
}

/**
 * Class MoveRight
 */
class MoveRight implements Action{
    constructor(public readonly y:number) {} 
    /**
     * Handle Tetris Move Right
     */
    apply(s:State):State {

    if(AllowedToMoveRight(s)){
        return {...s,
        yOffset: s.yOffset + this.y // Update the y offset 
        }
    }else
        return {...s}  
    }
}

/**
 * Function to check if the tetris is allowed to move right
 * @param input state
 * @returns true if tetris is allowed to move right
 */
const AllowedToMoveRight = (s:State): boolean => {
    // True if tetris move within right boundary
    const withinRightBoundary = (s.yOffset - (AllColumnIsEmpty(s.currTetris, 2) ? 1 : 0) + 3) < Constants.GRID_WIDTH;

    // True if going to collide with other tetris
    const collision = deleteEmptyRow(s.currTetris).some((row, row_index) =>
        row.some((column, column_index) => {
            const updatedRow = row_index + s.xOffset;
            const updatedColumn = column_index + s.yOffset + 1;

            // Check row bounds and column bounds
            if (
                updatedRow >= 0 &&
                updatedRow < Constants.GRID_HEIGHT &&
                updatedColumn >= 0 &&
                updatedColumn < Constants.GRID_WIDTH
            ) {
                // Check for collision with existing block
                return column === 1 && s.game[updatedRow][updatedColumn] === 1;
            }

            // If the indices are out of bounds, no collision
            return false;
        }))

    // Return true if allowed to move right and no collision
    return withinRightBoundary && !collision;
}

/**
 * Class MoveRight
 * @see updateGame
 */
class MoveDown implements Action{
    constructor() {} 
    /**
     * Handle Tetris Move Down
     */
    apply(s:State):State {
        return updateGame(s);
    }
}

/**
 * Class Restart
 */
class Restart implements Action { 
    constructor() { } 
    /**
     * Action types that trigger game restart
     */
    apply = (s:State) => {

        // Only allowed to restart when game over
        if(s.gameEnd){
            return{
                ...initialState, 
                highScore: s.highScore, // only highScore not affected by restart
                game: createEmptyGameGrid()
            };
        }

        // Nothing happens when in game
        return s;
    }
}

/**
 * Class ClearLastRow
 */
class ClearLastRow implements Action { 
    constructor() { } 
    /**
     * Action types that trigger power-ups (clear the last row of tetris), where score and others not affected
     */
    apply = (s:State) => {
        
        // power-up > 0, 
        // the last row contains at least 1 tetris,
        // in game
        if(s.game[Constants.GRID_HEIGHT - 1].some(c => c ===1) && s.powerUpLeft > 0 && !s.gameEnd){
            
            // copy the values from current game grid
            const newGameGrid = [...s.game];

            // delete the target from the game grid
            newGameGrid.splice(Constants.GRID_HEIGHT - 1, 1); 

            // Create separate empty row arrays for the cleared row
            const emptyRows = createEmptyRows(1);

        // Add empty rows to the top of game grid
        const updatedGameGrid = [...emptyRows, ...newGameGrid];

        return{
            ...s,
            game: updatedGameGrid,
            powerUpLeft: s.powerUpLeft - 1 // minus power-up
        }
    }

    // if power-up condition not met, nothing modified
    return s
    }
}


/**
 * Class Rotate
 */
class Rotate implements Action { 
    constructor() { } 
    /**
     * Action types that trigger power-ups (clear the last row of tetris), where score and others not affected
     */
    apply = (s:State) => {
        return rotate(s)
    }
}

/**
 * Function to rotate the current tetris
 * @param input state
 * @returns updated state with rotated tetris
 * Refer to 
 * https://www.learnrxjs.io/learn-rxjs/recipes/tetris-game#collision.ts
 */
const rotate = (state: State): State =>{
    // Copy all the values from the current game state into the new game grid
    const newTetris = emptyTetris(state.currTetris.length);

    state.currTetris.forEach(
        (row, rowIndex) => row.forEach((column, columnIndex) => (newTetris[columnIndex][state.currTetris[0].length - 1 - rowIndex] = column))
    )

    return{
        ...state,
        currTetris: newTetris,
        yOffset: state.yOffset - rightOffsetAfterRotation(state, state.currTetris, newTetris) + leftOffsetAfterRotation(state)
    }
    }

/**
 * Function to rotate the current tetris
 * @param input state
 * @param tetris Tetris before rotate
 * @param updatedTetris Tetris to be rotated
 * @returns right offset after rotation
 * Refer to 
 * https://www.learnrxjs.io/learn-rxjs/recipes/tetris-game#collision.ts
 */
const rightOffsetAfterRotation = (
    state: State,
    tetris: TetrisPiece,
    updatedTetris: TetrisPiece
  ): number =>
    state.yOffset + updatedTetris.length === Constants.GRID_WIDTH + 1 &&
    tetris.every(e => e[2] === Constants.EMPTY_TETRIS)
      ? 1 : 0;


/**
 * Function to rotate the current tetris
 * @param input state
 * @returns left offset after rotation  
 * Refer to 
 * https://www.learnrxjs.io/learn-rxjs/recipes/tetris-game#collision.ts
 */
const leftOffsetAfterRotation = (game: State) => (game.yOffset < 0 ? 1 : 0);