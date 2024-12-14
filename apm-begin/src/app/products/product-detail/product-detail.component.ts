import { Component, inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError, EMPTY, Subscription, tap } from 'rxjs';

@Component({
    selector: 'pm-product-detail',
    templateUrl: './product-detail.component.html',
    standalone: true,
    imports: [NgIf, NgFor, CurrencyPipe]
})
export class ProductDetailComponent implements OnChanges, OnDestroy {

  // Just enough here for the template to compile
  @Input() productId: number = 0;
  errorMessage = '';
  subItem!: Subscription;
  // Product to display
  product: Product | null = null;

  // Set the page title
  pageTitle = this.product ? `Product Detail for: ${this.product.productName}` : 'Product Detail';

  private productService = inject(ProductService);

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
  ngOnDestroy(): void {
    //becaue onChanges
    if (this.subItem) {
      this.subItem.unsubscribe();
    }
  }

  addToCart(product: Product) {
  }
}
