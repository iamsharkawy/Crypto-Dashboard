// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'watchlist',
    pathMatch: 'full'
  },
  {
    path: 'watchlist',
    loadComponent: () =>
      import('./features/watchlist/watchlist')
        .then(m => m.WatchlistComponent)
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search')
        .then(m => m.SearchComponent)
  }
];
