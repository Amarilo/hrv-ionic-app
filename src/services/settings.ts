export class SettingsService {

    chartXsize: number = 30;
    dataStoredLimit: number = 300;
    notifyThreshold: number = 50;
    soundNotifications: boolean = true;
    debugMode: boolean = false;

    getChartSize(){
        return this.chartXsize;
    }

    setChartSize(value: number){
        this.chartXsize = value;
    }

    getDataStoredLimit(){
        return this.dataStoredLimit;
    }

    setDataStoredLimit(value: number){
        this.dataStoredLimit = value;
    }

    getNotifyThreshold(){
        return this.notifyThreshold;
    }
    
    setNotifyThreshold(value: number){
        this.notifyThreshold = value;
    }

    isSoundNotificationsOn(){
        return this.soundNotifications;
    }
    
    setSoundNotifications(value: boolean){
        this.soundNotifications = value;
    }

    isDebugModeOn(){
        return this.debugMode;
    }
    
    setDebugMode(value: boolean){
        this.debugMode = value;
    }

    setDefaults(){
        this.chartXsize = 30;
        this.dataStoredLimit = 300;
        this.notifyThreshold = 50;
        this.soundNotifications = false;
        this.debugMode = false;
    }
    //============
    // get(){
    //     return this.value;
    // }
    
    // set(value: number){
    //     this.value = value;
    // }

}