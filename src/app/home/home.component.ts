import { Component, OnInit, Output } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent  implements OnInit{  

  loginService: LoginService;
  constructor( private oidcSecurityService:OidcSecurityService, loginService: LoginService) { 
    this.loginService = loginService;
  }

  pageViewType = 'homePage';
  ngOnInit() {
    
  }

  isUserAuthenticated(): boolean {
    return this.loginService.isUserAuthenticated();
  }

}
