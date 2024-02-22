import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BingoTileComponent } from './bingo-tile.component';

describe('BingoTileComponent', () => {
  let component: BingoTileComponent;
  let fixture: ComponentFixture<BingoTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BingoTileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BingoTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
