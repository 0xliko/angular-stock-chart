import { Component, OnInit, Input,ViewChild} from '@angular/core';
import {
    ChartComponent,
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexTitleSubtitle
} from 'ng-apexcharts';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StockHourItem,StockDailyItem,StockData} from './stock-item.model';
import {BehaviorSubject} from 'rxjs';
export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    title: ApexTitleSubtitle;
};

declare const ApexCharts: any;

@Component({
  selector: 'app-stock-chart',
  templateUrl: './stock-chart.component.html',
  styleUrls: ['./stock-chart.component.sass']
})
//// her date format is D.M.Y
export class StockChartComponent implements OnInit {
  @ViewChild('chart', { static: true }) chart: ChartComponent;
  @Input()
  today:string;
  public stockChartOptions: any;
  stockEmitter$ = new BehaviorSubject<string>(this.stockChartOptions);
  private readonly API_URL = 'assets/data/stock.json';
  public stockItems:Array<StockHourItem> = [];
  public prices:Array<number>     =  [];
  public dates :Array<string>     =  [];
  public curDateIndex             =   0;
  public curNextYearDateIndex     =   0;
  public curNextNextYearDateIndex =   0;
  public nextYearDay;
  public nextNextYearDay;
  constructor(private httpClient: HttpClient) {}
  public mode:'1 month' | '12 months' = '1 month';
  public  modes = {'1 month':31,'12 months':365};
  public thisYear:number;
  ngOnInit(): void {
      const year  = this.today.split('.')[2];
      this.thisYear =  parseInt(year,10);
      this.initChart();
  }
  getPrevDate(dateStr){
        const date = new Date(dateStr);
        date.setTime(date.getTime()- 3600* 24 * 1000);
        return (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear();
  }
  private convertToDailyStockSeries()
  {
      let curDate = this.stockItems[0].date;
      let curPower = 0;
      let curSum = 0;
      this.nextYearDay = this.today.split('.')[0] + '.' + this.today.split('.')[1] + '.' + (this.thisYear+1);
      this.nextNextYearDay = this.today.split('.')[0] + '.' + this.today.split('.')[1] + '.' + (this.thisYear+2);
      this.stockItems.forEach((value: StockHourItem, index: number, array: StockHourItem[])=>{
          curPower  += value.power;
          curSum    += (value.quotation + value.totalSurcharge)* value.power;
          if(curDate !== value.date){
              this.prices.push(curPower===0?0: parseFloat((curSum/curPower).toFixed(2)));
              this.dates.push(this.getPrevDate(value.month+'/'+value.day+'/'+value.year));
              curDate  = value.date;
              curPower = 0;
              curSum   = 0;
              if(curDate === this.today ) this.curDateIndex = this.dates.length;
              if(curDate === this.nextYearDay) this.curNextYearDateIndex = this.dates.length;
              if(curDate === this.nextNextYearDay) this.curNextNextYearDateIndex = this.dates.length;
          }
      });
      this.updateGraph();
  }
  private initChart() {
      this.stockChartOptions = {
          chart: {
              height: 350,
              type: 'line',
              shadow: {
                  enabled: false,
                  color: '#bbb',
                  top: 3,
                  left: 2,
                  blur: 3,
                  opacity: 1
              }
          },
          stroke: {
              width: 1,
              curve: 'smooth'
          },
          series: [
              {
                  name: this.thisYear,
                  data: []
              },
              {
                  name: this.thisYear+1,
                  data: []
              },
              {
                  name: this.thisYear+2,
                  data: []
              }
          ],
          xaxis: {
              type: 'datetime',
              categories: [],
              labels: {
                  style: {
                      colors: '#9aa0ac'
                  }
              }
          },
          title: {
              text: 'Stock Chart',
              align: 'center',
              style: {
                  fontSize: '16px',
                  color: '#666'
              }
          },
          colors:['#007bff','#3dec3a','#f40e0e'],
          fill: {
              type: 'solid',
              opacity:1,
              gradient: {
                  shade: 'dark',
                  gradientToColors: ['#007bff','#3dec3a','#f40e0e'],
                  shadeIntensity: 1,
                  type: 'horizontal',
                  opacityFrom: 1,
                  opacityTo: 1,
                  stops: [0, 100, 100, 100]
              }
          },
          markers: {
              size: 0,
              opacity: 0.9,
              colors: ['#007bff','#3dec3a','#f40e0e'],
              strokeColor: '#fff',
              strokeWidth: 1,
              hover: {
                  size: 7
              }
          },
          yaxis: {
              min: -10,
              max: 40,
              title: {
                  text: 'CHF/MWH'
              },
              labels: {
                  style: {
                      color: '#9aa0ac'
                  }
              }
          }
      };
      this.httpClient.get<StockData>(this.API_URL).subscribe(
          data => {
              this.stockItems = data.calcPriceTrans;
              this.convertToDailyStockSeries();
          },
          (error: HttpErrorResponse) => {
              console.log(error.name + ' ' + error.message);
          }
      );


  }
  private updateGraph(){

      const days = this.modes[this.mode];
      /// fill current year data
      let start = Math.max(0,this.curDateIndex - days + 1 );
      this.stockChartOptions.series[0].data = this.prices.slice(start,this.curDateIndex+1);
      this.stockChartOptions.xaxis.categories = this.dates.slice(start,this.curDateIndex+1);
      if(this.stockChartOptions.xaxis.categories.length < days){
          while(this.stockChartOptions.xaxis.categories.length !== days){
              const prevDate = this.getPrevDate(this.stockChartOptions.xaxis.categories[0]);
              this.stockChartOptions.xaxis.categories = [prevDate].concat(this.stockChartOptions.xaxis.categories);
              this.stockChartOptions.series[0].data = [0].concat(this.stockChartOptions.series[0].data);
          }
      }
      /// fill next year date
      start = Math.max(0,this.curNextYearDateIndex - days + 1 );
      this.stockChartOptions.series[1].data = this.prices.slice(start,this.curNextYearDateIndex+1);
      if(this.stockChartOptions.series[1].data.length !== days){
         while(this.stockChartOptions.series[1].data.length !== days){
             this.stockChartOptions.series[1].data.push(0);
         }
      }
      /// fill next next year date
      start = Math.max(0,this.curNextNextYearDateIndex - days + 1 );
      this.stockChartOptions.series[2].data = this.prices.slice(start,this.curNextNextYearDateIndex+1);
      if(this.stockChartOptions.series[2].data.length !== days){
          while(this.stockChartOptions.series[2].data.length !== days){
              this.stockChartOptions.series[2].data.push(0);
          }
      }
      this.chart.updateOptions(this.stockChartOptions);
  }
  changeRange(range){
      if(this.mode === range) return;
      this.mode = range;
      this.updateGraph();

  }
  downloadCSV(){}

}
