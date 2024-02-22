import { CommonModule } from "@angular/common";
import { Component, Input } from '@angular/core';
import { ICell } from "../../services/game-state.service";

@Component({
  selector: 'app-bingo-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bingo-cell.component.html',
  styleUrl: './bingo-cell.component.scss'
})
export class BingoCellComponent {
  @Input()
  cell?: ICell;
}
