import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tvq-root',
  imports: [RouterOutlet],
  template: `<h1>Hello, {{ title() }}</h1>
  <router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootComponent implements OnInit {
  protected readonly title = signal('webextension');
  ngOnInit() {
      console.log('The Root Component');
  }
}

