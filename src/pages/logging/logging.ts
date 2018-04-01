import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { DeviceService } from '../../services/device';
import { UtilityService } from '../../services/utility';
import { Observable ,Subscription } from 'rxjs';

/**
 * Generated class for the LoggingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-logging',
  templateUrl: 'logging.html',
})
export class LoggingPage {
  logArr = ['log START >>>'];
  hrSubscriber: Subscription;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private deviceService: DeviceService,
              private util: UtilityService,
              private zone: NgZone
            ) {}

  onStartReading(){
    this.hrSubscriber = this.deviceService.start_HR_reading().subscribe(
      data => {
        this.zone.run(() => {
          let hexArr = this.util.stringToHexArray(this.util.bytesToString(data));
          this.logArr.push(JSON.stringify(hexArr));
        });
      },
      err => {
        this.zone.run(() => {
          this.logArr.push(JSON.stringify(err));
        });
      }
    );
  }
  
  onStopReading(){
    this.hrSubscriber.unsubscribe();
    this.deviceService.stop_HR_reading();
    this.logArr.push('>>> log END')
  }

  onStartNotifications(){
    this.deviceService.start_HR_notifications();
  }

  onStopNotifications(){
    this.deviceService.stop_HR_notifications();
  }

  

}
