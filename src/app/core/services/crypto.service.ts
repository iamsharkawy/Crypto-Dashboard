import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable, catchError, of, retry, timer
} from 'rxjs';
import { Coin, CoinHistory, CoinSearchResult } from '../models/coin.model';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);

  private readonly BASE_URL = 'https://api.coingecko.com/api/v3';

  readonly defaultCoins = [
    'bitcoin', 'ethereum', 'binancecoin',
    'solana', 'ripple', 'cardano'
  ];

  private readonly PRICES_TTL  = 25_000;
  private readonly HISTORY_TTL = 5 * 60_000;
  private readonly SEARCH_TTL  = 60_000;

  getMarketPrices(coinIds: string[]): Observable<Coin[]> {
    const cacheKey = `prices:${coinIds.join(',')}`;
    const cached = this.cache.get<Coin[]>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('vs_currency', 'usd')
      .set('ids', coinIds.join(','))
      .set('order', 'market_cap_desc')
      .set('sparkline', 'false')
      .set('price_change_percentage', '24h');

    return this.http
      .get<Coin[]>(`${this.BASE_URL}/coins/markets`, { params })
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            if (error.status === 429 || error.status >= 500) {
              return timer(1000 * Math.pow(2, retryCount));
            }
            throw error;
          }
        }),
        catchError(err => {
          console.error('Prices fetch failed after retries:', err);
          return of([]);
        })
      );
  }

  cacheMarketPrices(coinIds: string[], data: Coin[]): void {
    this.cache.set(`prices:${coinIds.join(',')}`, data, this.PRICES_TTL);
  }

  getCoinHistory(coinId: string, days: number): Observable<CoinHistory> {
    const cacheKey = `history:${coinId}:${days}`;

    const cached = this.cache.get<CoinHistory>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('vs_currency', 'usd')
      .set('days', days.toString());

    return this.http
      .get<CoinHistory>(
        `${this.BASE_URL}/coins/${coinId}/market_chart`,
        { params }
      )
      .pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => {
            if (error.status === 429 || error.status >= 500) {
              return timer(1500 * Math.pow(2, retryCount));
            }
            throw error;
          }
        }),
        catchError(err => {
          console.error('History fetch failed:', err);
          return of({ prices: [] });
        })
      );
  }

  cacheHistory(coinId: string, days: number, data: CoinHistory): void {
    this.cache.set(`history:${coinId}:${days}`, data, this.HISTORY_TTL);
  }

  searchCoins(query: string): Observable<{ coins: CoinSearchResult[] }> {
    const cacheKey = `search:${query.toLowerCase()}`;

    const cached = this.cache.get<{ coins: CoinSearchResult[] }>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams().set('query', query);

    return this.http
      .get<{ coins: CoinSearchResult[] }>(
        `${this.BASE_URL}/search`,
        { params }
      )
      .pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => {
            if (error.status === 429) {
              return timer(2000 * Math.pow(2, retryCount));
            }
            throw error;
          }
        }),
        catchError(() => of({ coins: [] }))
      );
  }

  cacheSearch(query: string, data: { coins: CoinSearchResult[] }): void {
    this.cache.set(`search:${query.toLowerCase()}`, data, this.SEARCH_TTL);
  }

  formatHistoryForChart(prices: [number, number][]): {
    labels: string[];
    data: number[];
  } {
    return {
      labels: prices.map(([timestamp]) =>
        new Date(timestamp).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric'
        })
      ),
      data: prices.map(([, price]) => price),
    };
  }
}
