# 📈 Crypto Dashboard

A real-time cryptocurrency price dashboard built with **Angular 21** and **RxJS**.
Live prices, 7-day history charts, and a searchable coin watchlist.

🔗 **[Live Demo](YOUR_VERCEL_URL_HERE)**

---

## Screenshots

### Watchlist
![Watchlist](.github/screenshots/watchlist.png)
*Live prices with 60-second auto-refresh and green/red 24h change indicators*

### Price History Chart
![Chart](.github/screenshots/chart.png)
*7-day price history with dynamic green/red coloring based on price direction*

### Search
![Search](.github/screenshots/search.png)
*Debounced search — waits 400ms after typing before calling the API*

---

## Features

- **Live watchlist** — prices auto-refresh every 60 seconds
- **Price history** — 7, 14, or 30-day charts fetched on demand
- **Search** — debounced coin search with instant watchlist toggle
- **Smart caching** — prices cached 25s, history 5min, search 1min
- **Retry logic** — exponential backoff on 429 rate limit errors
- **Persistent watchlist** — saved to localStorage across sessions

---

## Tech stack

| Tech | Purpose |
|------|---------|
| Angular 21 | Framework — standalone components, signals |
| RxJS | interval(), switchMap(), debounceTime(), distinctUntilChanged() |
| Angular HttpClient | REST API calls with provideHttpClient(withFetch()) |
| Chart.js + ng2-charts | Line charts for price history |
| CoinGecko API | Free public crypto price data — no API key needed |
| Angular Material | UI components |
| localStorage | Watchlist persistence |

---

## RxJS patterns demonstrated

- **`interval()` + `switchMap()`** — auto-refresh that cancels in-flight requests
- **`debounceTime()` + `distinctUntilChanged()`** — search input optimization
- **`retry()` with exponential backoff** — graceful 429 rate limit handling
- **`catchError()` + `of()`** — fallback values instead of crashes
- **`tap()`** — side effects (loading state) without modifying the stream
- **`takeUntilDestroyed()`** — automatic subscription cleanup, no memory leaks
- **`Subject`** — manually triggered Observable for user-driven fetches

---

## Angular patterns demonstrated

- Standalone components with lazy loading
- Smart / dumb component pattern
- Angular Signals for local UI state
- `input()` / `output()` signal-based API
- `HttpClient` with `withFetch()`
- In-memory caching service with TTL
- `DestroyRef` + `takeUntilDestroyed()` for cleanup

---

## Run locally

```bash
git clone https://github.com/YOUR_USERNAME/crypto-dashboard
cd crypto-dashboard
npm install
ng serve
```

Open `http://localhost:4200`

> No API keys needed. CoinGecko free tier used.

---

## Project structure
# Crypto-Dashboard
