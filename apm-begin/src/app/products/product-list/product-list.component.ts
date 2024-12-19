import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, EMPTY, pipe, Subscription, tap } from 'rxjs';

@Component({
    selector: 'pm-product-list',
    templateUrl: './product-list.component.html',
    standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, NgClass, ProductDetailComponent]
})
export class ProductListComponent implements OnInit, OnDestroy {
  sub!: Subscription;
  ngOnDestroy(): void {
    //this.sub.unsubscribe()
  }

  private productService = inject(ProductService);

   // Just enough here for the template to compile
  pageTitle = 'Products';
 

  // Products
  //products: Product[] = [];
  
  //DECLARITIVE NO NEED TO do this NGONINIT and remove subscription, not required, i just left in, but using the products$ declarative approach
  //in html use 'let product of products$ | async' -this will sub and unsub without having to explicitly on ngdestroy
  // readonly products$ = this.productService.products$
  // .pipe(
  //   tap(() => console.log('in component pipeline.')),
  //   catchError(err => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );
  //Use ToSignal
  products = this.productService.products;
  errorMessage = this.productService.productsError;
  
  // Selected product id to highlight the entry
  //selectedProductId: number = 0;
  
  //for subscribing notifications subject
 // readonly selectedProductId$ = this.productService.productSelected$;
 selectedProductId = this.productService.selectedProductId;

  ngOnInit(): void {
   /*
   this.sub = this.productService.getProducts().pipe(
      tap(() => console.log('in component pipeline.'))
    ).subscribe(products => {
      this.products = products
      console.log(this.products);
    });
    */
    
    /* Option 1
    this.sub = this.productService.getProducts().pipe(
      tap(() => console.log('in component pipeline.'))
    ).subscribe({
      next: products => {
      this.products = products
      console.log(this.products);
      },
      error: err => this.errorMessage = err
    });
    */

    //Recommened to use in pipeline instead of observable for more flexibility
    // this.sub = this.productService.getProducts().pipe(
    //   tap(() => console.log('in component pipeline.')),
    //   catchError(err => {
    //     this.errorMessage = err;
    //     return EMPTY;
    //   })
    // ).subscribe(products => {
    //   this.products = products
    //   console.log(this.products);
    // });

    // //USING DECLARATIVE APPROACH
    // this.sub = this.productService.products$
    // .pipe(
    //   tap(() => console.log('in component pipeline.')),
    //   catchError(err => {
    //     this.errorMessage = err;
    //     return EMPTY;
    //   })
    // ).subscribe(products => {
    //   this.products = products
    //   console.log(this.products);
    // });
  
  }



  onSelected(productId: number): void {
    //no more local use subject service method
    //this.selectedProductId = productId;
    this.productService.productSelected(productId);
    //now we need subscribers to react to this emission
  }
}
