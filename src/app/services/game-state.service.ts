import { Injectable } from "@angular/core";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBirthdayCake, faBreadSlice, faCampground, faCarAlt, faChild, faFootballBall, faGlobeAmericas, faGuitar, faHamburger, faHandPaper, faHandsHelping, faHouseUser, faLanguage, faMusic, faPaintBrush, faPaw, faPersonWalking, faPodcast, faRunning, faSeedling, faTree, faUserAstronaut, faUserGraduate, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { BehaviorSubject, Observable, distinctUntilChanged, filter, map } from "rxjs";

export interface IBingoTile {
  icon: IconProp;
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
  { icon: faLanguage, title: 'Speaks 3+ languages' },
  { icon: faGlobeAmericas, title: 'Has traveled to more than 3 continents' },
  { icon: faPaintBrush, title: 'Likes to do art' },
  { icon: faTree, title: 'Has visited a national park' },
  { icon: faUserAstronaut, title: 'Has met someone famous' },
  { icon: faHouseUser, title: 'Has lived in a different region or country' },
  { icon: faUtensils, title: 'Enjoys cooking traditional dishes' },
  { icon: faRunning, title: 'Has completed an endurance race' },
  { icon: faHandPaper, title: 'Is left-handed' },
  { icon: faMusic, title: 'Likes the same genre of music' },
  { icon: faChild, title: 'Has the same favorite childhood game / toy' },
  { icon: faPersonWalking, title: 'Has taken a dance class' },
  { icon: faCampground, title: 'Has gone camping in the past year' },
  { icon: faUserGraduate, title: 'Is the oldest sibling' },
  { icon: faPodcast, title: 'Loves podcasts' },
  { icon: faHandsHelping, title: 'Is involved in a social cause' },
  { icon: faGuitar, title: 'Can play a musical instrument or sing' },
  { icon: faBirthdayCake, title: 'Shares the same birthday month' },
  { icon: faBreadSlice, title: 'Enjoys baking' },
  { icon: faSeedling, title: 'Enjoys gardening' },
  { icon: faFootballBall, title: 'Has the same favorite sport team' },
  { icon: faPaw, title: 'Has a pet' },
  { icon: faHamburger, title: 'Has the same favorite food' },
  { icon: faCarAlt, title: 'Drives a hybrid car' }
];

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  readonly hasBingo$: Observable<boolean>;

  private readonly checkedCellIdsSubject = new BehaviorSubject<Symbol[]>([]);

  private readonly previewSubject = new BehaviorSubject<ITileCell | null>(null);
  readonly preview$ = this.previewSubject.asObservable();

  private readonly cells: ICell[];
  private readonly tileCellsByTitle: Map<string, ITileCell>;
  constructor() {
    const cells = tiles.map((tile, i): ITileCell => {
      const id = Symbol();

      const checked$ = this.checkedCellIdsSubject.asObservable().pipe(map(x => x.includes(id)));
      const previewing$ = this.preview$.pipe(map(c => c?.tile === tile));

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
        this.preview = null;
      })
  }

  set preview(val: ITileCell | null) {
    this.previewSubject.next(val);
  }
  get preview() {
    return this.previewSubject.value;
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

  reset(confirm = true) {
    if (confirm && this.checkedCellIdsSubject.value.length > 0) {
      if (!window.confirm("Are you sure?")) {
        return;
      }
    }

    this.preview = null;
    this.checkedCellIdsSubject.next([]);
  }
}
