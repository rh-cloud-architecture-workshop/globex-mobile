import { Injectable } from "@angular/core";
import { LogService } from "./log.service";
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { HandleError, HttpErrorHandler } from './http-error-handler.service';
import serverEnvConfig from "client.env.config";
import { Category } from "./models/category.model";


@Injectable()
export class CoolStoreProductsService {

  prodByCategoryUrl = serverEnvConfig.ANGULR_API_GETPRODUCTSBYCATEGORY;  // URL to web api
  getCategoriesUrl = serverEnvConfig.ANGULR_API_GETCATEGORIES;  // URL to web api

  private handleError: HandleError;
  private logService: LogService;
  http: HttpClient;

  constructor(logService: LogService,  http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.logService = logService;
    this.http = http;
    this.handleError = httpErrorHandler.createHandleError('CoolStoreProductsService');
  }

  


  fetchProducyByCategory(categoryName:String, custId:String): Observable<any> {
    return this.http.get<any>(this.prodByCategoryUrl+"/"+categoryName + "/" + custId )
      .pipe(
        catchError(this.handleError('fetchPaginatedProductsList', ''))
      );
  }


  fetchCategories(custId:String): Observable<Category[]> {
    return this.http.get<Category[]>(this.getCategoriesUrl + "/" + custId)
      .pipe(
        catchError(this.handleError('[[ProductsService]-[fetchCatalogueList]', null))
      );
  }

}
