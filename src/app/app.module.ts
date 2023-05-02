import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';  

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import {  AuthStateResult, EventTypes, OidcClientNotification, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';

import { HeaderComponent } from './header/header.component';
import { AppComponent } from './app.component';
import { CoolStoreProductsService } from './coolstore-products.service';
import { LogService } from './log.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpErrorHandler } from './http-error-handler.service';
import { MessageService } from './message.service';
import { HomeComponent } from './home/home.component';
import { AppConfigService } from './providers/app-config.service'
import { CoolstoreCookiesService } from './coolstore-cookies.service';
import { LoginService } from './login.service';
import { CustomerService } from './customer.service'
import { AppRoutingModule } from './app-routing.module';
import { AuthConfigModule } from './auth-config.module';
import { filter } from 'rxjs';
import { CategoryComponent } from './category/category.component';
import { ProductsComponent } from './products/products.component';
import { DummyAuthPopUpService } from './dummy-auth-popup.service';

export function initConfig(appConfig: AppConfigService) {
  return () => appConfig.loadConfig();
}



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    CategoryComponent, ProductsComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    FormsModule, ReactiveFormsModule,
    AppRoutingModule, AuthConfigModule,
    HttpClientModule, CommonModule,
    NgbModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER, useFactory: initConfig,  deps: [AppConfigService],  multi: true
    },
    CoolStoreProductsService, LogService, CookieService, HttpErrorHandler, MessageService, 
    CoolstoreCookiesService, LoginService, CustomerService, OidcSecurityService, DummyAuthPopUpService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(private readonly eventService: PublicEventsService) {
    this.eventService
      .registerForEvents()
      .pipe(filter((notification) => notification.type === EventTypes.NewAuthenticationResult))
      .subscribe((result: OidcClientNotification<AuthStateResult>) => {
        console.log("AuthStateResult", result)
        
      });
  }
}
