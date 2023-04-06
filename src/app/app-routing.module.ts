import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { CategoryComponent } from './category/category.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';


const routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},    
    {path: 'products/:categoryName', component: ProductsComponent, canActivate: [AutoLoginPartialRoutesGuard]},
    {path: 'categories', component: CategoryComponent, canActivate: [AutoLoginPartialRoutesGuard]}
    
  
  ];
  
  
  @NgModule({
    imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking',})],
    exports: [RouterModule],
  })
  export class AppRoutingModule {}

  