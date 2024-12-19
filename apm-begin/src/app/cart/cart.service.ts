import { computed, effect, Injectable, signal } from "@angular/core";
import { CartItem } from "./cart";
import { Product } from "../products/product";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  //Must be writeable signal, hover cartItems
cartItems = signal<CartItem[]>([]);

cartCount = computed(() => this.cartItems()
  .reduce((accumeQty, item) => accumeQty + item.quantity, 0)
);

subTotal = computed(() => this.cartItems()
.reduce((accTotal, item) =>
  accTotal + (item.quantity * item.product.price),0));

deliveryFee = computed<number>(() => this.subTotal() < 50 ? 5.99 : 0);

tax = computed(() => Math.round(this.subTotal() * 10.75) / 100);

totalPrice = computed(() => this.subTotal() + this.deliveryFee() + this.tax());

//an effect
eLength = effect(() => console.log('Cart array Length', this.cartItems().length))

addToCart2(product: Product): void {
  //this.cartItems().push({product, quantity: 1});
  //update signal
  this.cartItems.update(items => 
    [...items, {product, quantity: 1}]); //...makes a copy and paste in object
}

// Add the vehicle to the cart
  // If the item is already in the cart, increase the quantity
  addToCart(product: Product): void {
    const index = this.cartItems().findIndex(item =>
      item.product.id === product.id);
    if (index === -1) {
      // Not already in the cart, so add with default quantity of 1
      this.cartItems.update(items => [...items, { product, quantity: 1 }]);
    } else {
      // Already in the cart, so increase the quantity by 1
      this.cartItems.update(items =>
        [
          ...items.slice(0, index),
          { ...items[index], quantity: items[index].quantity + 1 },
          ...items.slice(index + 1)
        ]);
    }
  }


updateCart(cartItem: CartItem, quantity: number): void {
  //signal methods
  //create ..item with quanity if matches, if not return the same item
  this.cartItems.update(items => 
    items.map(item => item.product.id === cartItem.product.id ? 
      { ...item, quantity} : item));
}
// Update the cart quantity
updateQuantity(cartItem: CartItem, quantity: number): void {
  // Update the cart with a new array containing
  // the updated item and all other original items
  this.cartItems.update(items =>
    items.map(item => item.product.id === cartItem.product.id ?
      { ...item, quantity } : item));
}


removeFromCart(cartItem: CartItem): void {
  this.cartItems.update(items => 
    //copies items exept the one we removing
    items.filter(item => item.product.id !== cartItem.product.id)
  );
}

}
