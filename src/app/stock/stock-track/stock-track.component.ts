import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { combineLatestWith, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { StockService } from '../stock.service';
import { QuoteModel } from '../../shared/models/quote.model';
import { CompanyModel } from '../../shared/models/company.model';
import { StockDetailsModel } from '../../shared/models/stock-details.model';

@Component({
  selector: 'app-stock-track',
  templateUrl: './stock-track.component.html',
  styleUrls: ['./stock-track.component.css'],
})
export class StockTrackComponent implements OnInit, OnDestroy {
  @ViewChild('trackSymbol', { static: true }) refSymbol: ElementRef;

  subscriptionSearch: Subscription;

  loading: boolean = false;

  constructor(
    private stockService: StockService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {}

  trackStock() {
    let searchValue = this.refSymbol.nativeElement.value;
    if (
      searchValue &&
      searchValue != null &&
      searchValue !== '' &&
      searchValue.trim() != ''
    ) {
      this.searchQuoteDataAndCompanyName(searchValue.trim());
    } else {
      //error popup
      this.toast.error('Invalid Search', 'ERROR');
    }
    this.refSymbol.nativeElement.value = null;
  }

  searchQuoteDataAndCompanyName(symbol: string) {
    this.loading = true;
    const quoteDataObservable =
      this.stockService.getCurrentStockQuoteData(symbol);
    const companyDataObservable = this.stockService.getCompanyName(symbol);

    this.subscriptionSearch = quoteDataObservable
      .pipe(combineLatestWith(companyDataObservable))
      .subscribe(
        ([quoteDataRes, companyDataRes]: [QuoteModel, CompanyModel]) => {
          this.loading = false;
          if (
            quoteDataRes &&
            quoteDataRes !== null &&
            companyDataRes &&
            companyDataRes !== null
          ) {
            const stockDetails: StockDetailsModel = {
              symbol: symbol,
              quote: quoteDataRes,
              company: companyDataRes,
            };
            this.saveStockDetailsToLocalStorage(stockDetails);
          } else if (quoteDataRes === null) {
            //error popup
            this.toast.error('Something Going Wrong With quoteData', 'ERROR');
          } else if (companyDataRes === null) {
            //error popup
            this.toast.error('Something Going Wrong With companyData', 'ERROR');
          }
        },
        (error) => {
          this.loading = false;
          //error popup
          console.log(error);
          this.toast.error('Something Going Wrong', 'ERROR');
        }
      );
  }

  saveStockDetailsToLocalStorage(stockDetails: StockDetailsModel) {
    let tmpStocks: StockDetailsModel[] =
      this.stockService.getStockDataFromLocalStorage();
    if (tmpStocks && tmpStocks != null && tmpStocks.length > 0) {
      let filterStockIsExists: StockDetailsModel = tmpStocks.filter(
        (x) => x.symbol === stockDetails.symbol
      )[0];
      if (filterStockIsExists && filterStockIsExists !== null) {
        //error popup
        this.toast.error('This Stock Already Exists. Symbol : ' + filterStockIsExists.symbol, 'ERROR');
      } else {
        // tmpStocks.push(stockDetails);
        tmpStocks.unshift(stockDetails);
        this.stockService.setStockDataToLocalStorage(tmpStocks);
      }
    } else {
      this.stockService.setStockDataToLocalStorage([stockDetails]);
    }
  }

  ngOnDestroy(): void {
    this.subscriptionSearch?.unsubscribe();
  }
}
