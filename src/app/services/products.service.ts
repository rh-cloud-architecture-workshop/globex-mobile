import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';
import serverEnvConfig from "client.env.config";
import { Category } from "../models/category.model";


@Injectable()
export class ProductsService {


  prodByCategoryUrl = serverEnvConfig.ANGULR_API_GETPRODUCTSBYCATEGORY;  // URL to web api
  paginationLimit = serverEnvConfig.ANGULR_API_GETPAGINATEDPRODUCTS_LIMIT; //number of products per page
  getCategoriesUrl = serverEnvConfig.ANGULR_API_GETCATEGORIES;  // URL to web api

  private handleError: HandleError;
  http: HttpClient;

  constructor( http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.http = http;
    this.handleError = httpErrorHandler.createHandleError('ProductsService');
  }

  fetchProducyByCategory(categoryName:String): Observable<any> {
    return this.http.get<any>(this.prodByCategoryUrl+"/"+categoryName  )
      .pipe(
        catchError(this.handleError('fetchPaginatedProductsList', ''))
      );
  }


  fetchCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.getCategoriesUrl)
      .pipe(
        catchError(this.handleError('[[ProductsService]-[fetchCatalogueList]', null))
      );
  }

  

}
