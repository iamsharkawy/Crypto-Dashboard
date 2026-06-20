import { Injectable, signal, computed, inject } from '@angular/core';
import { CryptoService } from './crypto.service';
import { Coin } from '../models/coin.model';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private _lastUpdated = signal<Date | null>(null);
  readonly lastUpdated = this._lastUpdated.asReadonly();
  private cryptoSvc = inject(CryptoService);

  private _watchedIds = signal<string[]>(
    this.loadFromStorage('cd_watched', this.cryptoSvc.defaultCoins)
  );

  private _coins = signal<Coin[]>([]);

  private _loading = signal(false);

  private _error = signal<string | null>(null);

  readonly watchedIds = this._watchedIds.asReadonly();
  readonly coins = this._coins.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly sortedCoins = computed(() =>
    [...this._coins()].sort((a, b) => b.market_cap - a.market_cap)
  );

  fetchPrices(): void {
    this._loading.set(true);
    this._error.set(null);

    this.cryptoSvc.getMarketPrices(this._watchedIds()).subscribe({
      next: coins => {
        if (coins.length > 0) {
          this.cryptoSvc.cacheMarketPrices(this._watchedIds(), coins);
          this._coins.set(coins);
          this._lastUpdated.set(new Date());  // ← add this
        }
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Failed to load prices. Will retry.');
        this._loading.set(false);
      }
    });
  }

  addToWatchlist(id: string): void {
    if (this._watchedIds().includes(id)) return;
    this._watchedIds.update(ids => [...ids, id]);
    this.saveToStorage('cd_watched', this._watchedIds());
    this.fetchPrices();  // refresh immediately to include the new coin
  }

  removeFromWatchlist(id: string): void {
    this._watchedIds.update(ids => ids.filter(i => i !== id));
    this._coins.update(coins => coins.filter(c => c.id !== id));
    this.saveToStorage('cd_watched', this._watchedIds());
  }

  isWatched(id: string): boolean {
    return this._watchedIds().includes(id);
  }

  private saveToStorage<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : fallback;
    } catch {
      return fallback;
    }
  }


}
