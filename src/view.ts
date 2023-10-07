export { updateView, startGameRender }
import {State, TetrisPiece} from "./types"
import { attr, createEmptyGameGrid, createEmptyPreviewGrid, deleteEmptyRow, updatePosition } from './util'
import { Constants, BlockConstants,Viewport } from "./constants";


/**
 * Render the canvas. 
 * Cubes visibility by default is "hidden"
 */
const startGameRender = () =>{
  // Canvas elements
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement & HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement & HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Create an empty game grid
  const gameGrid = createEmptyGameGrid();

  // Create an empty preview grid
  const previewGrid =  createEmptyPreviewGrid();
  
  // Create Cubes For gameGrid
  gameGrid.forEach((row, rowIndex) => {
    row.forEach((column: number, columnIndex) => {
      const x = columnIndex * BlockConstants.WIDTH;
      const y = rowIndex * BlockConstants.HEIGHT;

      const c = createSvgElement(svg.namespaceURI, "rect", {
        ...cube,
        x: String(x),
        y: String(y),
        })
      svg.appendChild(c);
    });
  });

  // Create Cubes For previewGrid
  previewGrid.forEach((row, rowIndex) => {
    row.forEach((column: number, columnIndex) => {
      const x = columnIndex * BlockConstants.WIDTH;
      const y = rowIndex * BlockConstants.HEIGHT;

      const c = createSvgElement(preview.namespaceURI, "rect", {
        ...cube,
        x: String(x),
        y: String(y),
        })
      preview.appendChild(c);
    });
  });
}

/**
 * SVG data of cube
 */
const cube = {
  height: `${BlockConstants.HEIGHT}`,
  width: `${BlockConstants.WIDTH}`,
  style: "fill: brown",
  visibility: "hidden"
}

/**
 * Renders the current state to the canvas. Rendering (side effects)
 *
 * In MVC terms, this updates the View using the Model.
 *
 * @param s Current state
 */
const updateView = (state: State) => {

  // Canvas elements
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
  const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;
  const powerUp = document.querySelector("#powerUp") as HTMLElement;
  const deBuff = document.querySelector("#deBuff") as HTMLElement;
  const rowCleared = document.querySelector("#rowCleared") as HTMLElement;

  // Create an empty game grid
  const gameGrid = createEmptyGameGrid();

  // Create an empty preview grid
  const previewGrid =  createEmptyPreviewGrid();

  // Copy all the values from the current game state into the new game grid
  try{
    state.game.forEach((r, i) => r.forEach((c, j) => (gameGrid[i][j] = c)));
  }
  catch(e){
    "d"
  }

  // Update the game grid based on current Tetris
  deleteEmptyRow(state.currTetris).forEach((row: number[], row_index: number) =>
  row.forEach(
    (column, column_index) =>
      { 
        try{gameGrid[row_index + state.xOffset][column_index + state.yOffset] = 
        updatePosition(gameGrid[row_index + state.xOffset][column_index + state.yOffset],column)}
        catch(e){
          "already update"
        }
      }
    )
  );

  // Update the preview grid based on preview Tetris
  deleteEmptyRow(state.nextTetris).forEach((row: number[], row_index: number) =>
  row.forEach(
    (column, column_index) =>
      { 
        try{previewGrid[row_index + Viewport.PREVIEW_X][column_index + Viewport.PREVIEW_Y] = 
        updatePosition(previewGrid[row_index + Viewport.PREVIEW_X][column_index + Viewport.PREVIEW_Y],column)}
        catch(e){
          "already update"
        }
      }
    )
  );
  
  // Update the canvas based on previewGrid
  updateCanvas(previewGrid, preview);
    
  // Update the canvas based on gameGrid
  updateCanvas(gameGrid, svg);
  
  // Update text field based on state value
  levelText.textContent = String(state.gameLevel);
  scoreText.textContent = String(state.score);
  highScoreText.textContent = String(state.highScore);
  powerUp.textContent = String(state.powerUpLeft);
  deBuff.textContent = String(state.debuffTime ) + "s";
  rowCleared.textContent = String(state.totalRowCleared);
  
  // Render game over & restart instuction 
  if (state.gameEnd) {
    show(gameover);
  } else {
    hide(gameover);
  }
};


/**
 * Update the canvas based on input grid and canvas
 */
const updateCanvas = (grid: number[][], canvas: SVGGraphicsElement) => {
  grid.forEach((row, rowIndex) => {
    row.forEach((column: number, columnIndex) => {

      const x = columnIndex * BlockConstants.WIDTH;
      const y = rowIndex * BlockConstants.HEIGHT;
      
      const selectedRect = canvas.querySelector(`rect[x="${x}"][y="${y}"]`) as SVGGraphicsElement & HTMLElement;
      
      // SVG element already exise, using show and hide to control
      if (selectedRect){
        if(column){
          show(selectedRect)
        }else{
          hide(selectedRect);
        }
      }
    });
  });
}

/**
 * Creates an SVG element with the given properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {}
  ): SVGGraphicsElement => {
    const elem = document.createElementNS(namespace, name) as SVGGraphicsElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
  };


/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    elem.parentNode!.appendChild(elem);
  };
  
/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) =>
  elem.setAttribute("visibility", "hidden");