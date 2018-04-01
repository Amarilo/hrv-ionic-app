import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoggingPage } from './logging';

@NgModule({
  declarations: [
    LoggingPage,
  ],
  imports: [
    IonicPageModule.forChild(LoggingPage),
  ],
})
export class LoggingPageModule {}
