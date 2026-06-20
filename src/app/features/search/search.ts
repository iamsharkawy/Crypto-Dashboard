import {
  Component, inject, signal, DestroyRef, OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject, switchMap, debounceTime,
  distinctUntilChanged, tap, filter
} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CryptoService } from '../../core/services/crypto.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { CoinSearchResult } from '../../core/models/coin.model';
import { SearchResultCardComponent } from './search-result/search-result-card';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, MatIcon, SearchResultCardComponent],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchComponent implements OnInit {
  private cryptoSvc = inject(CryptoService);
  private watchlistSvc = inject(WatchlistService);
  private destroyRef = inject(DestroyRef);

  query = signal('');
  results = signal<CoinSearchResult[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  hasSearched = signal(false);

  private searchInput$ = new Subject<string>();

  ngOnInit(): void {
    this.searchInput$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter(q => q.trim().length >= 2),
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.results.set([]);
        }),
        switchMap(q => this.cryptoSvc.searchCoins(q)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.cryptoSvc.cacheSearch(this.query(), response);
          this.results.set(response.coins.slice(0, 10));
          this.loading.set(false);
          this.hasSearched.set(true);
        },
        error: () => {
          this.error.set('Search failed. Try again.');
          this.loading.set(false);
        }
      });
  }

  onInput(value: string): void {
    this.query.set(value);
    if (!value.trim()) {
      this.results.set([]);
      this.hasSearched.set(false);
      return;
    }
    this.searchInput$.next(value);
  }

  clearSearch(): void {
    this.query.set('');
    this.results.set([]);
    this.hasSearched.set(false);
    this.error.set(null);
  }

  addToWatchlist(id: string): void {
    this.watchlistSvc.addToWatchlist(id);
  }

  removeFromWatchlist(id: string): void {
    this.watchlistSvc.removeFromWatchlist(id);
  }

  isWatched(id: string): boolean {
    return this.watchlistSvc.isWatched(id);
  }
}
