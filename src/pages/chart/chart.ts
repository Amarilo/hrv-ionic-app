import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Chart } from 'chart.js';
import { Subscription } from 'rxjs/Subscription';
import { DeviceService } from '../../services/device';
import { UtilityService } from '../../services/utility';
import { Slides } from 'ionic-angular';
import { Vibration } from '@ionic-native/vibration';
import { SettingsPage } from '../settings/settings';
import { SettingsService } from '../../services/settings';

/**
 * Generated class for the ChartPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chart',
  templateUrl: 'chart.html',
})
export class ChartPage {
  myChart: any;
  coherenceChart: any;
  myDoughnutChart: any;
  coherence = {coherence: 0, hits: 0, total: 0};
  myData = [];
  dataStoredLimit = 300;
  chartXsize = 30;
  coherenceCalculationTracker = 0;
  hrSubscriber: Subscription;
  conf99 = 0;

  notifyThreshold;
  soundNotifications;
  debugMode;
  //==for mock data
  myInterval: any;
  preDefTracker = 0;
  preDef = [70, 80, 70, 60];
  isRandom: boolean = false;
  //=====
  @ViewChild(Slides) slides: Slides;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private deviceService: DeviceService,
              private util: UtilityService,
              private settingsService: SettingsService,
              private zone: NgZone,
              private vibration: Vibration,
              private modalCtrl: ModalController
            ) {
  }

  ngOnInit(){
    this.getSettings();
    let xAxis = []
    for(let i = 0; i < this.chartXsize; i++){
      xAxis.push(i);
    }

    const hrCanvas = document.getElementById('hrCanvas');
    this.myChart = new Chart(hrCanvas, {
        type: 'line',
        data: {
          labels: xAxis,
          datasets: [{
              label: "HR Chart",
              borderColor: 'blue',
              fill: false,
              data: [] // Object.assign([], this.myData),
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:false,
                      suggestedMin: 60,
                      suggestedMax: 100
                  }
              }]
          }
        }
    });

    const coherenceCanvas = document.getElementById('coherenceCanvas');
    this.coherenceChart = new Chart(coherenceCanvas, {
        type: 'line',
        data: {
          labels: [1,2,3],
          datasets: [{
              label: "Coherence",
              borderColor: 'blue',
              fill: false,
              data: [5,-5,5] // Object.assign([], this.myData),
          },
          {
              label: "upper",
              borderColor: 'red',
              borderDash: [20, 20],
              fill: false,
              data: [2,2,2] // Object.assign([], this.myData),
          },
          {
            label: "lower",
            borderColor: 'red',
            borderDash: [20, 20],
            fill: false,
            data: [-2,-2,-2] // Object.assign([], this.myData),
        }
        ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:false,
                      suggestedMin: -1,
                      suggestedMax: 1
                  }
              }]
          }
        }
    });

    this.addDonutCenterTextPlugin();
    const donut = document.getElementById('donutCanvas');
    this.myDoughnutChart = new Chart(donut, {
      type: 'doughnut',
      data: {
        datasets: [{
            data: [10, 90],
            backgroundColor: [
              "#00FF00",
              "#FF6384"
            ]
        }],
        labels: [
          'Green',
          'Red'
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio : false,
        // cutoutPercentage: 50,
        elements: {
          center: {
            text: '10%',
            color: '#000000', // Default is #000000
            fontStyle: 'Arial', // Default is Arial
            sidePadding: 20 // Defualt is 20 (as a percentage)
          }
        }
      }
    });
  }

  getSettings(){
    this.chartXsize = this.settingsService.getChartSize();
    this.dataStoredLimit = this.settingsService.getDataStoredLimit();
    this.notifyThreshold = this.settingsService.getNotifyThreshold();
    this.soundNotifications = this.settingsService.isSoundNotificationsOn();
    this.debugMode = this.settingsService.isDebugModeOn();
  }

  onGoToSettings() {
    // this.navCtrl.push(SettingsPage);
    let settingsPage = this.modalCtrl.create(SettingsPage);
    settingsPage.present();
    settingsPage.onDidDismiss(
      isChanged => {
        if(isChanged){
          this.getSettings();
        }
      }
    );
  }

  onStartChart(){ // Start chart with mock data generation
    this.myInterval = setInterval(this.newDataPoint.bind(this), 500);
  }

  onStopChart() { //Stop chart with mock data generation
    clearInterval(this.myInterval);
  }

  getMockDataPoint(isRandom: boolean){
    let newPoint;
    if(isRandom){
      newPoint = 60 + (Math.random() * 40);
    }else{
      newPoint = this.preDef[this.preDefTracker];
      this.preDefTracker++;
      if(this.preDefTracker == 4){
        this.preDefTracker = 0;
      }
    }
    return newPoint;
  }

  newDataPoint() { // new Mock data point
     
    const newPoint = this.getMockDataPoint(this.isRandom);
    this.myData.push(newPoint);

    if(Math.round(Math.random()) == 1){
      const newPoint = this.getMockDataPoint(this.isRandom);
      this.myData.push(newPoint);
    }

    while(this.myData.length > this.dataStoredLimit){ // remove older data to fit max collection size
      this.myData.splice(0,1);
    }
    if(this.coherenceCalculationTracker == 15){
      this.coherenceCalculationTracker = 0;
      const autocorr = this.util.getAutocorrelation(this.myData);
      this.coherenceChart.data.datasets[0].data = Object.assign([], autocorr.y);
      this.coherenceChart.data.datasets[1].data = Array.from(new Array(autocorr.x.length), (x,i) => autocorr.conf99);
      this.coherenceChart.data.datasets[2].data = Array.from(new Array(autocorr.x.length), (x,i) => -autocorr.conf99);
      this.coherenceChart.data.labels = autocorr.x;
      this.coherenceChart.update(0);
      this.coherence = this.util.getCoherence(autocorr);

      this.myDoughnutChart.data.datasets[0].data = [this.coherence.coherence, 100 - this.coherence.coherence];
      this.myDoughnutChart.options.elements.center.text = this.coherence.coherence + '%';
      this.myDoughnutChart.update(0);
      //Notification
      if(this.soundNotifications && this.coherence.coherence < this.notifyThreshold){
        this.vibration.vibrate(1000);
      }
    }
    this.coherenceCalculationTracker++;

    if(this.myChart.data.labels.length != this.chartXsize){
      let xAxis = []
      for(let i = 0; i < this.chartXsize; i++){
        xAxis.push(i);
      }
      this.myChart.data.labels = xAxis;
    }
    this.myChart.data.datasets[0].data = Object.assign([], this.myData.slice(-this.chartXsize));
    this.myChart.update(0);
    
  }

  goToNextSlide() { // slide chart in view
    let currentIndex = this.slides.getActiveIndex();
    if(currentIndex == 0){
      this.slides.slideTo(1, 500);
    }else{
      this.slides.slideTo(0, 500);
    }
  }

  onStartHR_Reading(){ //Start Chart with BLE device data
    console.log("trying to subscribe");
    // Subscribe to get Data from BLE device
    this.myData = [];
    this.hrSubscriber = this.deviceService.start_HR_reading().subscribe(
      data => {
        this.zone.run(() => { //zone for letting angular now of data changes (data-binding)
          let hexArr = this.util.stringToHexArray(this.util.bytesToString(data)); //Data: String to HEX array: String[]
          const result = this.util.makeSense(hexArr); // from HEX array to {HR: [value], RR: [v1,v2,v...] } RR is integer 1 - 1024
          const rrhr = this.util.getRRHR_array(result); // from {HR, ...RR} get [RRHR1, RRHR2, RRHR...] RRHR is HR calculated from RR
          this.myData = this.myData.concat(rrhr); // add new HR data to collection
          while(this.myData.length > this.dataStoredLimit){ // remove older data to fit max collection size
            this.myData.splice(0,1);
          }

          // Update charts
          if(this.coherenceCalculationTracker == 15){
            this.coherenceCalculationTracker = 0;
            const autocorr = this.util.getAutocorrelation(this.myData);
            this.coherenceChart.data.datasets[0].data = Object.assign([], autocorr.y);
            this.coherenceChart.data.datasets[1].data = Array.from(new Array(autocorr.x.length), (x,i) => autocorr.conf99);
            this.coherenceChart.data.datasets[2].data = Array.from(new Array(autocorr.x.length), (x,i) => -autocorr.conf99);
            this.coherenceChart.data.labels = autocorr.x;
            this.coherenceChart.update(0);
            this.coherence = this.util.getCoherence(autocorr);

            this.myDoughnutChart.data.datasets[0].data = [this.coherence.coherence, 100 - this.coherence.coherence];
            this.myDoughnutChart.options.elements.center.text = this.coherence.coherence + '%';
            this.myDoughnutChart.update(0);
            //Notification
            if(this.soundNotifications && this.coherence.coherence < this.notifyThreshold){
              this.vibration.vibrate(1000);
            }
          }
          this.coherenceCalculationTracker++;

          if(this.myChart.data.labels.length != this.chartXsize){
              let xAxis = []
              for(let i = 0; i < this.chartXsize; i++){
                xAxis.push(i);
              }
              this.myChart.data.labels = xAxis;
          }
          this.myChart.data.datasets[0].data = Object.assign([], this.myData.slice(-this.chartXsize)); // show the latest 30 heart beats
          // this.myChart.data.datasets[0].data = Object.assign([], this.myData); // show all data on HR chart
          this.myChart.update(0);

        });
      },
      err => {
        this.zone.run(() => {
          console.log("subscription error " + JSON.stringify(err));
        });
      }
    );
  }

  onStopHR_Reading(){ //Stop Chart with BLE device data
    this.hrSubscriber.unsubscribe();
    this.deviceService.stop_HR_reading();
  }

  addDonutCenterTextPlugin(){
    Chart.pluginService.register({
      beforeDraw: function (chart) {
        if (chart.config.options.elements.center) {
          //Get ctx from string
          var ctx = chart.chart.ctx;
          
          //Get options from the center object in options
          var centerConfig = chart.config.options.elements.center;
          var fontStyle = centerConfig.fontStyle || 'Arial';
          var txt = centerConfig.text;
          var color = centerConfig.color || '#000';
          var sidePadding = centerConfig.sidePadding || 20;
          var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
          //Start with a base font of 30px
          ctx.font = "30px " + fontStyle;
          
          //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
          var stringWidth = ctx.measureText(txt).width;
          var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;
  
          // Find out how much the font can grow in width.
          var widthRatio = elementWidth / stringWidth;
          var newFontSize = Math.floor(30 * widthRatio);
          var elementHeight = (chart.innerRadius * 2);
  
          // Pick a new font size so it will not be larger than the height of label.
          var fontSizeToUse = Math.min(newFontSize, elementHeight);
  
          //Set font settings to draw it correctly.
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
          var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
          ctx.font = fontSizeToUse+"px " + fontStyle;
          ctx.fillStyle = color;
          
          //Draw text in center
          ctx.fillText(txt, centerX, centerY);
        }
      }
    });
  }

}
