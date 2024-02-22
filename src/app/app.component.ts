import { CommonModule } from "@angular/common";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from "rxjs";
import { BingoBoardComponent } from "./components/bingo-board/bingo-board.component";
import { GameStateService, IBingoTile } from "./services/game-state.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BingoBoardComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly previewTile$: Observable<IBingoTile | null>;
  readonly hasBingo$: Observable<boolean>;
  constructor(private readonly gameState: GameStateService) {
    this.previewTile$ = gameState.previewTile.selected$;
    this.hasBingo$ = gameState.hasBingo$;
  }

  toggleTile(tile: IBingoTile) {
    this.gameState.toggleTileChecked(tile);
  }
}
