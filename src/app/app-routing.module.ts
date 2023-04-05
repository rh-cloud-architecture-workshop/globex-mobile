import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { CategoryComponent } from './category/catalogue-list.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';

const routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'categories', component: CategoryComponent,canActivate: [AutoLoginPartialRoutesGuard] },
    {path: 'products/:categoryName', component: ProductsComponent, canActivate: [AutoLoginPartialRoutesGuard]},
  ];
  
  
  @NgModule({
    imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking',})],
    exports: [RouterModule],
  })
  export class AppRoutingModule {}

  