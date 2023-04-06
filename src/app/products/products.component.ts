import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Product } from '../models/product.model';
import serverEnvConfig from "client.env.config";
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ActivatedRoute } from '@angular/router';
import { CoolStoreProductsService } from '../coolstore-products.service';
import { CoolstoreCookiesService } from '../coolstore-cookies.service';

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
    @Inject(PLATFORM_ID) platformId:string, private productsService:CoolStoreProductsService , private coolstoreCookiesService:CoolstoreCookiesService ) {
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
    const custId = this.coolstoreCookiesService.user.name;
    this.productsService.fetchProducyByCategory(categoryName, custId)
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
