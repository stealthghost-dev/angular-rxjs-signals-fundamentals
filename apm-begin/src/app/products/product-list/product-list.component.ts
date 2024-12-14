import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { NgIf, NgFor, NgClass } from '@angular/common';
import { Product } from '../product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, EMPTY, pipe, Subscription, tap } from 'rxjs';

@Component({
    selector: 'pm-product-list',
    templateUrl: './product-list.component.html',
    standalone: true,
  imports: [NgIf, NgFor, NgClass, ProductDetailComponent]
})
export class ProductListComponent implements OnInit, OnDestroy {
  sub!: Subscription;
  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

  private productService = inject(ProductService);

   // Just enough here for the template to compile
  pageTitle = 'Products';
  errorMessage = '';

  // Products
  products: Product[] = [];

  // Selected product id to highlight the entry
  selectedProductId: number = 0;
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
    this.sub = this.productService.getProducts().pipe(
      tap(() => console.log('in component pipeline.')),
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    ).subscribe(products => {
      this.products = products
      console.log(this.products);
    });
  
  }
  onSelected(productId: number): void {
    this.selectedProductId = productId;
  }
}
