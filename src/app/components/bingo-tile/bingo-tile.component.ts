import { Component, Input } from '@angular/core';
import { IBingoTile } from "../../services/game-state.service";

@Component({
  selector: 'app-bingo-tile',
  standalone: true,
  imports: [],
  templateUrl: './bingo-tile.component.html',
  styleUrl: './bingo-tile.component.scss'
})
export class BingoTileComponent {
  @Input()
  tile?: IBingoTile;
}
