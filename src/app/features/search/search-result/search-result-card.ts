import { Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CoinSearchResult } from '../../../core/models/coin.model';
import {UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-search-result-card',
  standalone: true,
  imports: [MatIcon, UpperCasePipe],
  templateUrl: './search-result-card.html',
  styleUrl: './search-result-card.scss',
})
export class SearchResultCardComponent {
  coin = input.required<CoinSearchResult>();
  isWatched = input<boolean>(false);

  addRequested = output<string>();
  removeRequested = output<string>();
}
