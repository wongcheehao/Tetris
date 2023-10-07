import "./style.css";

import { fromEvent, interval, merge, Observable} from "rxjs";
import { map, filter, scan} from "rxjs/operators";
import { Action, Key, Event} from './types';
import { ClearLastRow, DeBuff, initialState, MoveDown, MoveLeft, MoveRight, reduceState, Restart, Rotate} from './state';
import { updateView } from './view';
import { Constants, BlockConstants } from "./constants";
import {Tick} from "./state";
import {startGameRender} from "./view";

/**
 * Main game function. Initialises all Observable streams
 */
export function main() {

  /**
   * Render the cubes to the canvas. Visibility by default is "hidden"
   */
  startGameRender();

  /** User input */
  const key$ = (e: Event, k: Key) =>
  fromEvent<KeyboardEvent>(document, e)
    .pipe(
      filter(({ code }) => code === k),
      filter(({ repeat }) => !repeat))

  /** Observables */
  /** 
   * Tick Observables, to handle tetris descending 
   * @see Tick
   */
  const tick$ = interval(Constants.DEFAULT_TICK_RATE_MS).pipe(map(elapsed => new Tick(elapsed)));

  /** 
   * deBuff Observables, to calculate time for debuff
   * @see deBuff
   */
  const deBuff$ = interval(Constants.DEBUFF_TICK).pipe(map(_ => new DeBuff()));

  /** User input Observables */
  const startLeftMove$ = key$('keydown', 'ArrowLeft').pipe(map(_ => new MoveLeft(-BlockConstants.MOVE_Y)))
  const startRightMove$ = key$('keydown', 'ArrowRight').pipe(map(_ => new MoveRight(BlockConstants.MOVE_Y)))
  const startDownMove$ = key$('keydown', 'ArrowDown').pipe(map(_ => new MoveDown()))
  const restart$ = key$('keydown', 'Space').pipe(map(_ => new Restart()))
  const powerUp$ = key$('keydown', 'Enter').pipe(map(_ => new ClearLastRow()))
  const rotate$ = key$('keydown', 'ArrowUp').pipe(map(_ => new Rotate()))

  /** 
   * Combine all obeservables
  */
  const action$: Observable<Action> = merge(tick$, deBuff$,startLeftMove$, startRightMove$, startDownMove$, restart$, powerUp$, rotate$);
  
  /**
   * The result of the reduceState function becomes the new state for the next iteration, 
   * and this new state is passed to the updateView function for rendering or updating the user interface.
   * @see reduceState
   * @see updateView
  */
  action$
    .pipe(scan(reduceState, initialState))
    .subscribe(updateView);
}

/**
 * The following simply runs main function on window load.
*/
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
