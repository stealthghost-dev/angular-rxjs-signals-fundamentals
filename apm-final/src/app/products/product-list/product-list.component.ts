import { Component, inject } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { ProductService } from '../product.service';
import { ProductDetailComponent } from '../product-detail/product-detail.component';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, NgClass, ProductDetailComponent]
})
export class ProductListComponent {
  pageTitle = 'Products';

  private productService = inject(ProductService);

  // Selected product id to highlight the entry
  //selectedProductId$ = this.productService.productSelected$; // Using a Subject

  selectedProductId = this.productService.selectedProductId;  // Using a signal
  products = this.productService.products;
  errorMessage = this.productService.productsErrorMessage;

  // products$ = this.productService.products$
  // .pipe(
  //   catchError(err => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );

  onSelected(productId: number): void {
    this.productService.productSelected(productId);
  }
}
