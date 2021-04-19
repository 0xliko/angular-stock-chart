import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { StockChartComponent } from './stock-chart/stock-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
@NgModule({
  declarations: [
    AppComponent,
    StockChartComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    HttpClientModule,
    NgApexchartsModule
  ],
  providers: [

  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
