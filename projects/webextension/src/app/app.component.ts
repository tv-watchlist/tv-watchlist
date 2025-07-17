import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'tvq-app',
    templateUrl: './app.component.html',
    imports: [RouterModule]
})
export class AppComponent {
  title = 'webextension';
}
