import { Component, computed, inject, Input, signal } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CartItem } from '../cart';
import { CartService } from '../cart.service';

@Component({
  selector: 'sw-cart-item',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, NgFor, NgIf],
  templateUrl: './cart-item.component.html'
})
export class CartItemComponent {
  //@Input({ required: true }) cartItem!: CartItem;
@Input({ required: true}) set cartItem(ci: CartItem) {
  this.item.set(ci);
}
  private cartService = inject(CartService);

  //Extended, handle null or undefiened not recommended
  item = signal<CartItem>(undefined!);

  // Quantity available (hard-coded to 8)
  // Mapped to an array from 1-8
  // SEE FINAL SOLUTION TO HANDLE DELETE CART ITEMS THAT ARE THE SAME.
  //qtyArr = [...Array(8).keys()].map(x => x + 1);

  // Build an array of numbers from 1 to qty available
    qtyArr = computed<Number[]>(() =>
      [...Array(this.item().product.quantityInStock).keys()].map(x => x + 1));

  // Calculate the extended price
  //exPrice = this.cartItem?.quantity * this.cartItem?.product.price;

  exPrice = computed(() => this.item().quantity * this.item().product.price );

  onQuantitySelected2(quantity: number): void {
    //this.cartService.updateCart(this.cartItem, Number(quantity));
    //input & signals workaround
    this.cartService.updateCart(this.item(), Number(quantity));
  }
  onQuantitySelected(quantity: number): void {
    this.cartService.updateQuantity(this.item(), Number(quantity));
  }

  removeFromCart(): void {
    //this.cartService.removeFromCart(this.cartItem);
    //input & signals workaround
    this.cartService.removeFromCart(this.item());
  }
}
