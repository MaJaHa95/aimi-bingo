import { CommonModule } from "@angular/common";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable, distinctUntilChanged, map } from "rxjs";
import { BingoBoardComponent } from "./components/bingo-board/bingo-board.component";
import { GameStateService, IBingoTile, ITileCell } from "./services/game-state.service";

interface IPreviewCellHeader {
  cell: ITileCell;
  affirmation: string;
  negation: string;
}

const affirmations = [
  "Absolutely!",
  "You know it!",
  "That's right!",
  "Yes, indeed!",
  "For sure!",
  "Yep, that's me!",
  "Totally me!",
  "Match!",
  "Affirmative!",
  "All me!",
  "Right here!",
  "No doubt!"
];

const negations = [
  "Oops, not me!",
  "Just kidding!",
  "Take it back!",
  "Changed my mind!",
  "Mistaken click!",
  "Not quite right!",
  "Hold on, not that one!",
  "Wait, maybe not!",
  "Nope, scratch that!",
  "On second thought, no.",
  "I spoke too soon!",
  "Actually, maybe not.",
  "My bad, uncheck!",
  "Let's reverse that!",
  "Err... nope!",
  "Rewind that!",
  "I take it back!",
  "Disregard!"
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BingoBoardComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly previewCell$: Observable<IPreviewCellHeader | null>;
  readonly hasBingo$: Observable<boolean>;
  constructor(private readonly gameState: GameStateService) {
    this.hasBingo$ = gameState.hasBingo$;

    this.previewCell$ = gameState.preview$.pipe(
      distinctUntilChanged((a, b) => !!a && !!b && a.id === b.id),
      map((cell): IPreviewCellHeader | null => {
        if (!cell) {
          return null;
        }

        return {
          cell,
          affirmation: affirmations[Math.floor(Math.random() * affirmations.length)],
          negation: negations[Math.floor(Math.random() * negations.length)]
        }
      })
    );
  }

  toggleTile(tile: IBingoTile) {
    this.gameState.toggleTileChecked(tile);
  }

  reset() {
    this.gameState.reset();
  }
}
