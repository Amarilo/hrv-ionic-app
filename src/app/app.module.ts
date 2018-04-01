import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { BLE } from '@ionic-native/ble';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Vibration } from '@ionic-native/vibration';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ChartPage } from '../pages/chart/chart';
import { DevicesPage } from '../pages/devices/devices';
import { LoggingPage } from '../pages/logging/logging';
import { SettingsPage } from '../pages/settings/settings';

import { UtilityService } from '../services/utility';
import { DeviceService } from '../services/device';
import { SettingsService } from '../services/settings';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ChartPage,
    DevicesPage,
    LoggingPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ChartPage,
    DevicesPage,
    LoggingPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BLE,
    BluetoothSerial,
    Vibration,
    UtilityService,
    DeviceService,
    SettingsService
  ]
})
export class AppModule {}
