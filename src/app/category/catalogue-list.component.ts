import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Subscription } from 'rxjs';
import { PaginatedProductsList } from '../models/product.model';
import serverEnvConfig from "client.env.config";
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';
import { ProductsService } from '../services/products.service';

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

  constructor(private oidcSecurityService:OidcSecurityService, private router: Router,
    @Inject(PLATFORM_ID) platformId:string, private productsService:ProductsService ) {
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
    this.productsService.fetchCategories()
      .subscribe(catalogueList => (
        this.categoriesList = catalogueList
        ));
  }

  viewProductsByCategory(catName) {

  }


}
