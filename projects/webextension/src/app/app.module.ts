import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RootComponent } from './root.component';
import { BackgroundComponent } from './background/background.component';
import { PopupComponent } from './popup/popup.component';
import { OptionsComponent } from './options/options.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    RootComponent,
    AppComponent,
    PopupComponent,
    BackgroundComponent,
    OptionsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    // This is needed because the manifest loads the index.html file, followed by a #,
   { provide: LocationStrategy, useClass: HashLocationStrategy }
],
  bootstrap: [RootComponent]
})
export class AppModule { }
