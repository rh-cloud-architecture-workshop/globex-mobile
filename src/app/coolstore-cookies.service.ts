import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HandleError, HttpErrorHandler } from './http-error-handler.service';

@Injectable({
  providedIn: 'root'
})

export class CoolstoreCookiesService {
  cookieService: CookieService;
  likeProductsListFromCookie = new Array;
  userDetailsMap = new Map;
  userDetailsFromCookie;
  private handleError: HandleError;
  http: HttpClient;
  userActivityObj;


  constructor(cookieService: CookieService, private route: ActivatedRoute, http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.cookieService = cookieService;
    this.http = http;
    this.handleError = httpErrorHandler.createHandleError('CoolstoreCookiesService');
    this.initialize();
  }

  initialize() {
    this.cookieService.delete('globex_session_token');
  }



  retrieveUserDetailsFromCookie() {
    return  this.userDetailsMap;
  }

  dateToFormattedString() {
    return new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString();
  };

  resetUser() {
    this.cookieService.delete('globex_session_token');
  }

  getSession() {
    if (this.cookieService.check('globex_session_token')) {
      return this.cookieService.get('globex_session_token');
    }
    return null;
  }
}


/**
 * generate groups of 4 random characters
 * @example getUniqueId(1) : 607f
 * @example getUniqueId(2) : 95ca-361a-f8a1-1e73
 */
 export function getUniqueId(parts: number): string {
  const stringArr = [];
  for(let i = 0; i< parts; i++){
    // tslint:disable-next-line:no-bitwise
    const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    stringArr.push(S4);
  }
  return stringArr.join('-');
}