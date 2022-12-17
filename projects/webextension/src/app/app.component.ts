import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'tvq-app',
  standalone: true,
  templateUrl: './app.component.html',
  imports:[RouterModule]
})
export class AppComponent {
  title = 'webextension';
}
