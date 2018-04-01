import { Component, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';
// import { BLE } from '@ionic-native/ble';
// import { UtilityService } from '../../services/utility';
import { DeviceService } from '../../services/device';

@IonicPage()
@Component({
  selector: 'page-devices',
  templateUrl: 'devices.html',
})
export class DevicesPage {
  scanData: Observable<any>;
  subscription: Subscription;
  devices = [];

  constructor(public navCtrl: NavController, 
        public navParams: NavParams, 
        private viewCtrl: ViewController,
        private deviceService: DeviceService,
        private zone: NgZone
      ) {
    
  }

  getObjectString(device: Object){
    return JSON.stringify(device);
  }

  connectDevice(deviceId: string) {
    this.deviceService.connectDevice(deviceId);
    this.viewCtrl.dismiss();
  }

  scanForDevices(){
    this.devices = [];
    
    this.subscription	=	this.deviceService.discoverDevices().subscribe(
      value	=>	{
        this.zone.run(() => {
          this.devices.push(value);
        });
      },
      error	=>	console.log(error.message)
    );
  }
 
  isConnectedDevice(deviceId: string){
    return deviceId == this.deviceService.connectedDeviceId;
  }

  isTargetDevice(deviceId: string){
    return deviceId == 'YOUR_DEVICE_ID'.toUpperCase();
  }

  closeModal(){
    this.viewCtrl.dismiss();
  }


}
