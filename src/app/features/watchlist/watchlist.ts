// src/app/features/watchlist/watchlist.ts
import {
  Component, inject, signal, OnInit, DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, startWith, switchMap } from 'rxjs';
import { WatchlistService } from '../../core/services/watchlist.service';
import { CryptoService } from '../../core/services/crypto.service';
import { CoinCardComponent } from './components/coin-card/coin-card';
import { CoinSkeletonComponent } from './components/coin-card/coin-skeleton/coin-skeleton';
import { CoinChartComponent } from './components/coin-chart/coin-chart';
import { MatIcon } from '@angular/material/icon';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CoinCardComponent,
    CoinSkeletonComponent,
    CoinChartComponent,
    MatIcon,
    DatePipe,
  ],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.scss',
})
export class WatchlistComponent implements OnInit {
  private watchlistSvc = inject(WatchlistService);
  private destroyRef = inject(DestroyRef);
  lastUpdated = this.watchlistSvc.lastUpdated;
  coins = this.watchlistSvc.sortedCoins;
  loading = this.watchlistSvc.loading;
  error = this.watchlistSvc.error;
  selectedCoinId = signal<string | null>(null);

  skeletons = Array(6);

  private readonly REFRESH_INTERVAL = 60_000;

  ngOnInit(): void {
    interval(this.REFRESH_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => {
          this.watchlistSvc.fetchPrices();
          return [];
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  openChart(coinId: string): void {
    this.selectedCoinId.update(id => id === coinId ? null : coinId);
  }

  toggleWatch(coinId: string): void {
    if (this.watchlistSvc.isWatched(coinId)) {
      this.watchlistSvc.removeFromWatchlist(coinId);
    } else {
      this.watchlistSvc.addToWatchlist(coinId);
    }
  }
}
