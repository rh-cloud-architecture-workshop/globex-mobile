import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { PaginatedProductsList } from '../models/product.model';
import serverEnvConfig from "client.env.config";
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';
import { CoolStoreProductsService } from '../coolstore-products.service';
import { CoolstoreCookiesService } from '../coolstore-cookies.service';


@Component({
  selector: 'app-catalogue-list',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit{

  isUserAuthenticated:boolean=false;
  searchedProduct: any;

  testBrowser: boolean = true;
  products = new PaginatedProductsList();
  paginationLimit = serverEnvConfig.ANGULR_API_GETPAGINATEDPRODUCTS_LIMIT; //number of products per page

  page = 1;
  custId: string;


  constructor(private oidcSecurityService:OidcSecurityService, private router: Router,
    @Inject(PLATFORM_ID) platformId:string, private productsService:CoolStoreProductsService, private coolstoreCookiesService:CoolstoreCookiesService ) {
    this.isUserAuthenticated = false;



  }
  ngOnInit(){
    this.fetchCatalogueList()
  }

  logout() {
    this.oidcSecurityService.logoff().subscribe((result) =>  {
      console.log(result);
      this.isUserAuthenticated = false;

    }
    );
  }

  categoriesList = []
  fetchCatalogueList() {
    const custId = this.coolstoreCookiesService.user.name;
    this.productsService.fetchCategories(custId)
      .subscribe(catalogueList => (
        this.categoriesList = catalogueList
        ));
  }

  viewProductsByCategory(catName) {

  }


}
