import {
  Component, inject, input, output,
  signal, computed, OnInit, DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, tap } from 'rxjs';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { MatIcon } from '@angular/material/icon';
import { CryptoService } from '../../../../core/services/crypto.service';
import { WatchlistService } from '../../../../core/services/watchlist.service';
import { Coin } from '../../../../core/models/coin.model';

@Component({
  selector: 'app-coin-chart',
  standalone: true,
  imports: [BaseChartDirective, CurrencyPipe, DecimalPipe, NgClass, MatIcon],
  templateUrl: './coin-chart.html',
  styleUrl: './coin-chart.scss',
})
export class CoinChartComponent implements OnInit {
  private cryptoSvc = inject(CryptoService);
  private watchlistSvc = inject(WatchlistService);
  private destroyRef = inject(DestroyRef);

  coinId = input.required<string>();
  closed = output<void>();

  loading = signal(true);
  error = signal<string | null>(null);
  selectedDays = signal(7);

  coinInfo = computed<Coin | undefined>(() =>
    this.watchlistSvc.coins().find(c => c.id === this.coinId())
  );

  chartData = signal<ChartData<'line'>>({ labels: [], datasets: [] });

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` $${ctx.parsed.y!.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#1e1e2e' },
        ticks: { color: '#555', maxTicksLimit: 7 }
      },
      y: {
        position: 'right',
        grid: { color: '#1e1e2e' },
        ticks: {
          color: '#555',
          callback: value => `$${Number(value).toLocaleString()}`
        }
      }
    },
    elements: {
      point: { radius: 0, hoverRadius: 5 },
      line: { tension: 0.4 }
    }
  };

  private fetchTrigger$ = new Subject<{ id: string; days: number }>();

  ngOnInit(): void {
    this.fetchTrigger$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(({ id, days }) =>
          this.cryptoSvc.getCoinHistory(id, days)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: history => {
          this.cryptoSvc.cacheHistory(
            this.coinId(), this.selectedDays(), history
          );

          if (!history.prices.length) {
            this.error.set('No chart data available for this period');
            this.loading.set(false);
            return;
          }

          const { labels, data } = this.cryptoSvc.formatHistoryForChart(
            history.prices
          );

          const isPositive = data[data.length - 1] >= data[0];
          const lineColor = isPositive ? '#1db97a' : '#e24b4a';
          const fillColor = isPositive
            ? 'rgba(29, 185, 122, 0.08)'
            : 'rgba(226, 75, 74, 0.08)';

          this.chartData.set({
            labels,
            datasets: [{
              data,
              borderColor: lineColor,
              backgroundColor: fillColor,
              fill: true,
              borderWidth: 2,
            }]
          });

          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load chart data');
          this.loading.set(false);
        }
      });

    this.triggerFetch();
  }

  selectDays(days: number): void {
    this.selectedDays.set(days);
    this.triggerFetch();
  }

  private triggerFetch(): void {
    this.fetchTrigger$.next({
      id: this.coinId(),
      days: this.selectedDays()
    });
  }
}
