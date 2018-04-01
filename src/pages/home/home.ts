import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';

import { DevicesPage } from '../devices/devices';
import { ChartPage } from '../chart/chart';
import { LoggingPage } from '../logging/logging';
import { SettingsPage } from '../settings/settings';

import { DeviceService } from '../../services/device';
import { UtilityService } from '../../services/utility';
import { SettingsService } from '../../services/settings';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  periphId: string;
  batteryData: string = '--';
  connLog: string;
  debugMode: boolean;

  constructor(public navCtrl: NavController, 
    private modalCtrl: ModalController, 
    private deviceService: DeviceService,
    private utilService: UtilityService,
    private settingService: SettingsService
  ) {
    this.debugMode = this.settingService.isDebugModeOn();
  }

  onGoToChart() {
    this.navCtrl.push(ChartPage);
  }

  onGoToSettings() {
    // this.navCtrl.push(SettingsPage);
    let settingsPage = this.modalCtrl.create(SettingsPage);
    settingsPage.present();
    settingsPage.onDidDismiss(
      isChanged => {
        if(isChanged){
          this.debugMode = this.settingService.isDebugModeOn();
        }
      }
    );
  }

  onGoToLogging() {
    this.navCtrl.push(LoggingPage);
  }

  onGoToDevices() {
    let modal = this.modalCtrl.create(DevicesPage);
    modal.present();
  }

  disconnectDevice(){
    this.deviceService.disconnectDevice();
  }

  readBattery(){
    this.deviceService.readBatteryLevel().then(
      data => { 
        this.batteryData = this.utilService.stringToDecimalArray(this.utilService.bytesToString(data))[0];
      }
    ).catch(
      err => {
        this.batteryData = 'error: ' + JSON.stringify(err);
      }
    );
  }

  printConnLog() {
    this.connLog = JSON.stringify(this.deviceService.connectionLog);
    this.periphId = this.deviceService.connectedDeviceId;
  }

  printDevice(){
    this.periphId = this.deviceService.connectedDeviceId;
  }

  printMockDevice(){
    this.periphId = "mock device id"
  }

  printConsoleLog(){
    console.log('IF you SEE this LOGS WORK !!!');
  }
}
