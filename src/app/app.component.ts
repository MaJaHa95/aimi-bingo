import { CommonModule } from "@angular/common";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from "rxjs";
import { BingoBoardComponent } from "./components/bingo-board/bingo-board.component";
import { GameStateService, IBingoTile, ITileCell } from "./services/game-state.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BingoBoardComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly previewCell$: Observable<ITileCell | null>;
  readonly hasBingo$: Observable<boolean>;
  constructor(private readonly gameState: GameStateService) {
    this.previewCell$ = gameState.preview$;
    this.hasBingo$ = gameState.hasBingo$;
  }

  toggleTile(tile: IBingoTile) {
    this.gameState.toggleTileChecked(tile);
  }
}
