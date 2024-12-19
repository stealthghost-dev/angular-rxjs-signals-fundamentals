import { Component, computed, inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { NgIf, NgFor, CurrencyPipe, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError, EMPTY, Subscription, tap } from 'rxjs';
import { CartService } from 'src/app/cart/cart.service';

@Component({
    selector: 'pm-product-detail',
    templateUrl: './product-detail.component.html',
    standalone: true,
    imports: [AsyncPipe, NgIf, NgFor, CurrencyPipe]
})
export class ProductDetailComponent {
//implements OnChanges, OnDestroy {

  // Just enough here for the template to compile
  
  //Replaced by Behavior subject notifications
  //@Input() productId: number = 0;
  //subItem!: Subscription;
  //product: Product | null = null;

  
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  //Declarative Subject
//  product$ = this.productService.product$
//   .pipe(
//     tap(() => console.log('in component pipeline.')),
//     catchError(err=> {
//       this.errorMessage = err;
//       return EMPTY;
//     })
//   );
  product = this.productService.product;
  errorMessage = this.productService.productError;


  // Set the page title - Replaced by Signals
  //pageTitle = this.product ? `Product Detail for: ${this.product.productName}` : 'Product Detail';
  //pageTitle = this.product ? `Product Detail for: ${this.product.productName}` : 'Product Detail';
  pageTitle = computed(() => this.product() 
  ? `Product Detail for: ${this.product()?.productName}` //why the ? mark, because it is optional chaining, if product is null, it will not throw an error
  : 'Product Detail');

  //handled by Behavior Subject subscribers
  /*
  ngOnChanges(changes: SimpleChanges): void {
    const id = changes['productId'].currentValue;
    if (id) {
      this.subItem = this.productService.getProduct(id)
      .pipe(
        tap(() => console.log('in component pipeline.')),
        catchError(err=> {
          this.errorMessage = err;
          return EMPTY;
        })
      ).subscribe(product => {
        this.product = product
        console.log(this.product);
      });
    }
  }
  */
  /*  
  ngOnDestroy(): void {
    //becaue onChanges
    if (this.subItem) {
      this.subItem.unsubscribe();
    }
  }
    */

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
