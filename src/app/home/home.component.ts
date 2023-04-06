import { Component, Output } from '@angular/core';
import { CoolstoreCookiesService } from '../coolstore-cookies.service';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent  {
  
  loginService:LoginService;
  coolstoreCookiesService:CoolstoreCookiesService;

  constructor(loginService:LoginService, coolstoreCookiesService:CoolstoreCookiesService ) { 
    this.loginService = loginService;
    this.coolstoreCookiesService = coolstoreCookiesService;
  }

  pageViewType = 'homePage';

}
