// Utility functions and definitions.
export { attr, randomGenerateTetris,createEmptyPreviewGrid, deleteEmptyRow, createEmptyRows, 
        createEmptyGameGrid, calculateGameScoreIncrease, calculateDebuffTimeIncrease, calculatePowerUpIncrease, emptyTetris, updatePosition}

import { TetrisPiece} from './types';
import { AllTetrisPieces, Viewport,BlockConstants, Constants} from './constants';

/**
 * set a number of attributes on an Element at once
 * @param e the Element
 * @param o a property bag
 */
const attr = (e: Element, o: { [p: string]: unknown }) => { for (const k in o) e.setAttribute(k, String(o[k])) }


/**
 * Function to create an empty game grid
 * @returns an empty game grid
 */
const createEmptyGameGrid = () : number[][] => 
  Array(Constants.GRID_HEIGHT)
    .fill(Constants.EMPTY_TETRIS)
    .map(() => Array(Constants.GRID_WIDTH).fill(Constants.EMPTY_TETRIS));

/**
 * Select a random Tetris piece from AllTetrisPieces
 */
const randomGenerateTetris = () => 
    AllTetrisPieces[Math.floor(Math.random() * AllTetrisPieces.length)];

/**
 * Creat an empty preview grid
 */
const createEmptyPreviewGrid = (): number[][] => 
  Array(Viewport.PREVIEW_HEIGHT / BlockConstants.HEIGHT)
    .fill(Constants.EMPTY_TETRIS)
    .map(() => Array(Viewport.PREVIEW_WIDTH / BlockConstants.WIDTH).fill(Constants.EMPTY_TETRIS));

/**
 * Function to delete empty row of a given tetris
 * @param tetris input tetris
 * @returns tetris with no empty row
 */
const deleteEmptyRow = (tetris: TetrisPiece): TetrisPiece =>
    tetris.filter(row => row.some(column => column === Constants.TETRIS));

/**
 * Function to create empty rows 
 * @param length length of the empty rows
 * @returns tetris with no empty row
 */
const createEmptyRows = (length: number): number[][] => Array(length).fill(0).map(() =>
    Array(Constants.GRID_WIDTH).fill(Constants.EMPTY_TETRIS)
);

/**
 * Function to calculate game score increase based on number of row cleared in a row
 * @param rowCleared number of row cleared in a row
 * @returns game score increase
 */
const calculateGameScoreIncrease = (rowCleared: number): number => {
    return rowCleared ** 2
}

/**
 * Function to debuff time increase based on number of row cleared in a row
 * @param rowCleared number of row cleared in a row
 * @returns debuff time increase
 */
const calculateDebuffTimeIncrease = (rowCleared: number): number => {
    return rowCleared * 10
}

/**
 * Function to calculate Power Up Increase based on number of row cleared in a row
 * @param rowCleared number of row cleared in a row
 * @returns Power Up Increase
 */
const calculatePowerUpIncrease = (rowCleared: number): number => {
    return rowCleared >= Constants.ADD_POWER_UP_THRESHOLD ? 1 : 0
}

/**
 * Function to create an empty tetris based on the input length
 * @param length tetris length
 * @returns empty tetris with input length
 */
const emptyTetris = (length: number): TetrisPiece =>
  Array(length)
    .fill(Constants.EMPTY_TETRIS)
    .map(e => Array(length).fill(Constants.EMPTY_TETRIS));

/**
 * Function to handle stacking behaviour
 * @targeted_position position to move to
 * @from_position position to move from
 * @returns correct position based on tetris stacking 
 */
const updatePosition = (targeted_position: number, from_position: number): number =>
  targeted_position === 0 ? from_position : targeted_position;
