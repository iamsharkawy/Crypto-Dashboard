import { Component } from '@angular/core';

@Component({
  selector: 'app-coin-skeleton',
  standalone: true,
  template: `
    <div class="skeleton-card">
      <div class="sk-row">
        <div class="sk-circle"></div>
        <div class="sk-lines">
          <div class="sk-line long"></div>
          <div class="sk-line short"></div>
        </div>
      </div>
      <div class="sk-price"></div>
      <div class="sk-line medium"></div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: #13131f;
      border: 1px solid #1e1e2e;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .sk-row { display: flex; align-items: center; gap: 10px; }
    .sk-circle { width: 36px; height: 36px; border-radius: 50%; }
    .sk-lines { display: flex; flex-direction: column; gap: 6px; }
    .sk-price { height: 32px; border-radius: 6px; width: 60%; }

    /* All skeleton elements share the shimmer animation */
    .sk-circle, .sk-line, .sk-price {
      background: linear-gradient(90deg, #1e1e2e 25%, #2a2a3e 50%, #1e1e2e 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .sk-line {
      height: 12px;
      &.long   { width: 80px; }
      &.short  { width: 40px; }
      &.medium { width: 120px; }
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class CoinSkeletonComponent {}
