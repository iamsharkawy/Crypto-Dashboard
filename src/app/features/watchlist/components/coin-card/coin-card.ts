import { Component, input, output } from '@angular/core';
import {CurrencyPipe, DecimalPipe, NgClass, UpperCasePipe} from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Coin } from '../../../../core/models/coin.model';

@Component({
  selector: 'app-coin-card',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, NgClass, MatIcon, UpperCasePipe],
  templateUrl: './coin-card.html',
  styleUrl: './coin-card.scss',
})
export class CoinCardComponent {
  coin = input.required<Coin>();
  isWatched = input<boolean>(true);

  // emits the coin id up to the parent
  chartRequested = output<string>();
  watchToggled = output<string>();
}
