export interface StockHourItem {
    _id: string;
    profileId: string,
    year: number,
    month: number;
    day: number;
    date: string;
    hour: number;
    quotation: number;
    power: number;
    avgPower: number;
    totalSurcharge: number;
}
export interface StockDailyItem {
    date: string;
    price: number;
}
export interface StockData {
    calcPriceTrans: StockHourItem[];
}
