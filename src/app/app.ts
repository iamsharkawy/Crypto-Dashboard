import { Component } from '@angular/core';
import {Sidebar} from './layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
