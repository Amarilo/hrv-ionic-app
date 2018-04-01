import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { SettingsService } from '../../services/settings';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  chartXsize: number;
  dataStoredLimit: number;
  notifyThreshold: number;
  soundNotifications: boolean;
  debugMode: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              private settingsService: SettingsService, private viewCtrl: ViewController) {
    this.getSettings();
  }

  getSettings(){
    this.chartXsize = this.settingsService.getChartSize();
    this.dataStoredLimit = this.settingsService.getDataStoredLimit();
    this.notifyThreshold = this.settingsService.getNotifyThreshold();
    this.soundNotifications = this.settingsService.isSoundNotificationsOn();
    this.debugMode = this.settingsService.isDebugModeOn();
  }

  setSettings(){
    this.settingsService.setChartSize(this.chartXsize);
    this.settingsService.setDataStoredLimit(this.dataStoredLimit);
    this.settingsService.setNotifyThreshold(this.notifyThreshold);
    this.settingsService.setSoundNotifications(this.soundNotifications);
    this.settingsService.setDebugMode(this.debugMode);
  }

  onSave(){
    this.setSettings();
    this.viewCtrl.dismiss(true);
  }

  onDefaults(){
    this.settingsService.setDefaults();
    this.viewCtrl.dismiss(true);
  }

  onCancel(){
    this.viewCtrl.dismiss();
  }
}
