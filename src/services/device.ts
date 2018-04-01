import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DeviceService {
    discoveryObservable: Observable<any>;
    connectionObservable: Observable<any>;
    hrObservable: Observable<any>;
    connectedDeviceId: string = null;
    connectionLog = [];

    HR_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
    CCC_DESCRIPTOR_UUID = '00002902-0000-1000-8000-00805f9b34fb';
    HR_MEASUREMENT_CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

    BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
    BATTERY_LVL_CHARACTERISTIC = '00002a19-0000-1000-8000-00805f9b34fb';


    constructor(private ble: BLE){}

    discoverDevices(){
        this.discoveryObservable = this.ble.scan([],5000);
        return this.discoveryObservable;
    }

    connectDevice(deviceId: string) {
        this.connectionObservable = this.ble.connect(deviceId);
        console.log('connected to' + deviceId);
        this.connectedDeviceId = deviceId;

        let subscriber = this.connectionObservable.subscribe(
            nextData => { this.connectionLog.push(nextData); },
            error => { this.connectionLog.push(error); } 
        );
        return this.connectionObservable;
    }

    disconnectDevice() {
        if(this.connectedDeviceId !== null){
            this.ble.disconnect(this.connectedDeviceId).then(
                something => {
                    console.log('disconnecting from ' + this.connectedDeviceId);
                    this.connectedDeviceId = null;
                }
            );
        }
    }

    // _checkConnection(deviceId: string) {
    //     this.ble.isConnected(deviceId).then(
    //         status => {
    //             if(status === true){
    //                 this.connectedDeviceId = deviceId;
    //             }else{
    //                 this.connectionObservable = null;
    //                 this.connectedDeviceId = null;
    //             }
    //         }
    //     ).catch(
    //         err => {
    //             this.connectionObservable = null;
    //             this.connectedDeviceId = null;
    //         }
    //     );
    // }

    readCharacteristic(serviceUUID: string, characteristicUUID: string) {
        return this.ble.read(this.connectedDeviceId, serviceUUID, characteristicUUID);
    }

    readBatteryLevel(){
        return this.readCharacteristic(this.BATTERY_SERVICE_UUID, this.BATTERY_LVL_CHARACTERISTIC);
    }

    start_HR_notifications(){
        const arr = new Uint8Array([1,0]);
        this.ble.writeWithoutResponse(this.connectedDeviceId, this.HR_SERVICE_UUID, 
            this.CCC_DESCRIPTOR_UUID, arr.buffer);
    }

    stop_HR_notifications(){
        const arr = new Uint8Array([0,0]);
        this.ble.writeWithoutResponse(this.connectedDeviceId, this.HR_SERVICE_UUID, 
            this.CCC_DESCRIPTOR_UUID, arr.buffer);
    }


    start_HR_reading() {
        this.hrObservable = this.ble.startNotification(this.connectedDeviceId, this.HR_SERVICE_UUID, 
                                                        this.HR_MEASUREMENT_CHARACTERISTIC_UUID);
        return this.hrObservable;
    }

    stop_HR_reading() {
        this.ble.stopNotification(this.connectedDeviceId, this.HR_SERVICE_UUID, 
                                this.HR_MEASUREMENT_CHARACTERISTIC_UUID)
        .then(
            good => {
                this.hrObservable = null;
            }
        );
    }

}