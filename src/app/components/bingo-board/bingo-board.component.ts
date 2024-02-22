import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject, fromEvent, map, merge, of, shareReplay, switchMap, takeUntil, withLatestFrom } from "rxjs";
import { GameStateService, ICell } from "../../services/game-state.service";
import { observeResizes } from "../../utilities/resize-observable";
import { BingoCellComponent } from "../bingo-cell/bingo-cell.component";


@Component({
  selector: 'app-bingo-board',
  standalone: true,
  imports: [BingoCellComponent, CommonModule],
  templateUrl: './bingo-board.component.html',
  styleUrl: './bingo-board.component.scss'
})
export class BingoBoardComponent implements OnDestroy {
  readonly cells: ICell[];
  readonly columnCount = 5;
  readonly gridGapPx = 10;

  readonly isPreviewing$: Observable<boolean>;
  readonly hasBingo$: Observable<boolean>;

  private readonly destroy$ = new Subject<void>();
  private readonly previewingCoordinateSubject = new BehaviorSubject<{ x: number, y: number } | null>(null);
  private readonly container$ = new BehaviorSubject<ElementRef<HTMLElement> | null>(null);

  private readonly touchingSubject = new BehaviorSubject<boolean>(false);

  constructor(private readonly gameState: GameStateService) {
    this.cells = this.gameState.getCells();
    this.hasBingo$ = gameState.hasBingo$;

    const rowCount = this.cells.length / this.columnCount;

    const containerRect$ = this.container$.asObservable().pipe(
      switchMap(c => !c ? of(null) : merge(fromEvent(window, "resize"), observeResizes(c.nativeElement)).pipe(
        map(() => c.nativeElement.getBoundingClientRect()),
      )),
      shareReplay({
        refCount: true,
        bufferSize: 1
      })
    );

    this.previewingCoordinateSubject.asObservable().pipe(
      withLatestFrom(containerRect$),
      map(c => {
        const coordinate = c[0];
        const gridRect = c[1];
        if (!coordinate || !gridRect) {
          return null;
        }

        // Calculate mouse position relative to the grid
        const mouseX = coordinate.x - gridRect.left;
        const mouseY = coordinate.y - gridRect.top;

        const mouseXPercent = mouseX / gridRect.width;
        const mouseYPercent = mouseY / gridRect.height;

        // Calculate which column and row the mouse is over
        const col = Math.floor(mouseXPercent * this.columnCount);
        const row = Math.floor(mouseYPercent * rowCount);

        const index = (row * this.columnCount) + col;

        return this.cells[index];
      }),
      takeUntil(this.destroy$)
    ).subscribe(c => {
      this.gameState.preview = c?.type === "tile" ? c : null;
    });

    this.isPreviewing$ = this.gameState.preview$.pipe(map(c => !!c));
  }

  @ViewChild("container")
  set container(val: ElementRef<HTMLElement> | null) {
    this.container$.next(val);
    console.log("container", val);
  }
  get container() {
    return this.container$.value;
  }

  onTouchStart(evt: MouseEvent | TouchEvent) {
    this.touchingSubject.next(true);
    this.onTouchMove(evt);
  }

  onTouchMove(evt: MouseEvent | TouchEvent) {
    if (!this.touchingSubject.value) {
      return;
    }

    if (evt instanceof TouchEvent) {
      if (evt.touches.length === 0) {
        return;
      }

      this.previewingCoordinateSubject.next({
        x: evt.touches[0].clientX,
        y: evt.touches[0].clientY
      });
    }
    else if (evt instanceof MouseEvent) {
      this.previewingCoordinateSubject.next({
        x: evt.clientX,
        y: evt.clientY
      });
    }

    evt.preventDefault();
  }

  onTouchEnd() {
    this.touchingSubject.next(false);
  }

  getShouldMagnifyObservable(cell: ICell) {
    if (!cell.previewing$) {
      return of(false);
    }

    return this.touchingSubject.asObservable().pipe(switchMap(c => !c ? of(false) : cell.previewing$));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
