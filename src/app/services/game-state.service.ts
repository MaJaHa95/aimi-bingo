import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, distinctUntilChanged, filter, map } from "rxjs";

export interface IBingoTile {
  icon: string;
  title: string;
}

export interface ICellBase<T extends string> {
  readonly type: T;
  readonly id: symbol;
}
export interface IBingoCell extends ICellBase<"bingo"> {
  readonly tile?: undefined;

  readonly checked$?: undefined;
  readonly previewing$?: undefined;
}
export interface ITileCell extends ICellBase<"tile"> {
  readonly tile: IBingoTile;

  readonly checked$: Observable<boolean>;
  readonly previewing$: Observable<boolean>;
}
export type ICell = IBingoCell | ITileCell;


const tiles: IBingoTile[] = [
  { icon: 'fas fa-language', title: 'Speaks 3+ languages' },
  { icon: 'fas fa-globe-americas', title: 'Has traveled to more than 3 continents' },
  { icon: 'fas fa-paint-brush', title: 'Likes to do art' },
  { icon: 'fas fa-tree', title: 'Has visited a national park' },
  { icon: 'fas fa-user-astronaut', title: 'Has met someone famous' },
  { icon: 'fas fa-house-user', title: 'Has lived in a different region or country' },
  { icon: 'fas fa-utensils', title: 'Enjoys cooking traditional dishes' },
  { icon: 'fas fa-running', title: 'Has completed an endurance race' },
  { icon: 'fas fa-hand-paper', title: 'Is left-handed' },
  { icon: 'fas fa-music', title: 'Likes the same genre of music' },
  { icon: 'fas fa-child', title: 'Has the same favorite childhood game / toy' },
  { icon: 'fas fa-person-walking', title: 'Has taken a dance class' },
  { icon: 'fas fa-campground', title: 'Has gone camping in the past year' },
  { icon: 'fas fa-user-graduate', title: 'Is the oldest sibling' },
  { icon: 'fas fa-podcast', title: 'Loves podcasts' },
  { icon: 'fas fa-hands-helping', title: 'Is involved in a social cause' },
  { icon: 'fas fa-guitar', title: 'Can play a musical instrument or sing' },
  { icon: 'fas fa-birthday-cake', title: 'Shares the same birthday month' },
  { icon: 'fas fa-bread-slice', title: 'Enjoys baking' },
  { icon: 'fas fa-seedling', title: 'Enjoys gardening' },
  { icon: 'fas fa-football-ball', title: 'Has the same favorite sport team' },
  { icon: 'fas fa-paw', title: 'Has a pet' },
  { icon: 'fas fa-hamburger', title: 'Has the same favorite food' },
  { icon: 'fas fa-car-alt', title: 'Drives a hybrid car' }
];

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  readonly previewTile: ISelectableTile = new SelectableTile();

  readonly hasBingo$: Observable<boolean>;

  private readonly checkedCellIdsSubject = new BehaviorSubject<Symbol[]>([]);

  private readonly cells: ICell[];
  private readonly tileCellsByTitle: Map<string, ITileCell>;
  constructor() {
    const cells = tiles.map((tile, i): ITileCell => {
      const id = Symbol();

      const checked$ = this.checkedCellIdsSubject.asObservable().pipe(map(x => x.includes(id)));
      const previewing$ = this.previewTile.selected$.pipe(map(c => c === tile));

      return {
        id,
        type: "tile",
        tile,
        checked$,
        previewing$
      }
    });

    this.tileCellsByTitle = new Map(cells.map(cell => [cell.tile.title, cell]));

    this.cells = cells;
    this.cells.splice(12, 0, { id: Symbol("bingo"), type: "bingo" });

    this.hasBingo$ = this.checkedCellIdsSubject.pipe(
      map(checkedIds => {
        const gridSize = 5;

        const isSelected = (cell: ICell) => {
          return cell.type === "bingo" || checkedIds.includes(cell.id);
        };

        // Check rows and columns
        for (let i = 0; i < gridSize; i++) {
          let rowSelected = true;
          let colSelected = true;
          for (let j = 0; j < gridSize; j++) {
            if (!isSelected(this.cells[i * gridSize + j])) {
              rowSelected = false;
            }
            if (!isSelected(this.cells[j * gridSize + i])) {
              colSelected = false;
            }
          }

          if (rowSelected || colSelected) {
            return true;
          }
        }

        // Check diagonals
        let diag1Selected = true;
        let diag2Selected = true;
        for (let i = 0; i < gridSize; i++) {
          if (!isSelected(this.cells[i * gridSize + i])) {
            diag1Selected = false;
          }
          if (!isSelected(this.cells[i * gridSize + (gridSize - i - 1)])) {
            diag2Selected = false;
          }
        }

        if (diag1Selected || diag2Selected) {
          return true;
        }

        return false;
      })
    );

    this.hasBingo$
      .pipe(distinctUntilChanged(), filter(c => !!c))
      .subscribe(c => {
        this.previewTile.selected = null;
      })
  }

  getCells() {
    return this.cells;
  }

  toggleTileChecked(tile: IBingoTile) {
    const cell = this.tileCellsByTitle.get(tile.title);
    if (!cell) {
      return;
    }

    const newChecked = [...this.checkedCellIdsSubject.value];
    const ind = newChecked.indexOf(cell.id);
    if (ind < 0) {
      newChecked.push(cell.id);
    }
    else {
      newChecked.splice(ind, 1);
    }
    this.checkedCellIdsSubject.next(newChecked);
  }
}

export interface ISelectableTile {
  selected: IBingoTile | null;
  selected$: Observable<IBingoTile | null>;
}

class SelectableTile implements ISelectableTile {
  private readonly selectedSubject = new BehaviorSubject<IBingoTile | null>(null);

  readonly selected$ = this.selectedSubject.asObservable();

  set selected(val: IBingoTile | null) {
    this.selectedSubject.next(val);
  }
  get selected() {
    return this.selectedSubject.value;
  }
}

