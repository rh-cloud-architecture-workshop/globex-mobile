import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { PaginatedProductsList, Product } from '../models/product.model';
import serverEnvConfig from "client.env.config";
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../services/products.service';
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  isUserAuthenticated:boolean=false;
  searchedProduct: any;
  
  categoryName:String;
  testBrowser: boolean = true;
  products:Product[];
  paginationLimit = serverEnvConfig.ANGULR_API_GETPAGINATEDPRODUCTS_LIMIT; //number of products per page

  page = 1;

  constructor(private oidcSecurityService:OidcSecurityService, private route: ActivatedRoute,
    @Inject(PLATFORM_ID) platformId:string, private productsService:ProductsService ) {
      this.isUserAuthenticated = false;
  }
  
  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    console.log("routeParams", routeParams)
    this.categoryName = String(routeParams.get('categoryName'));
    console.log("productIdFromRoute", this.categoryName)
    if (this.testBrowser) {
      this.fetchProductByCategory(this.categoryName);
    }
  }

  

  fetchProductByCategory(categoryName:String) {
    this.productsService.fetchProducyByCategory(categoryName)
      .subscribe(products => (this.products = products));
  }

  

  loadPage(event:any){
    if(this.page != event) {
      this.page = event;
      this.fetchProductByCategory(event);
      console.log("this.products", this.products)
    }
  }

}
