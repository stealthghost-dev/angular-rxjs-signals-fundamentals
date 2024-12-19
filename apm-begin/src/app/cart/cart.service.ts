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

addToCart(product: Product): void {
  //this.cartItems().push({product, quantity: 1});
  //update signal
  this.cartItems.update(items => 
    [...items, {product, quantity: 1}]); //...makes a copy and paste in object
}

updateCart(cartItem: CartItem, quantity: number): void {
  //signal methods
  //create ..item with quanity if matches, if not return the same item
  this.cartItems.update(items => 
    items.map(item => item.product.id === cartItem.product.id ? 
      { ...item, quantity} : item));
}

removeFromCart(cartItem: CartItem): void {
  this.cartItems.update(items => 
    //copies items exept the one we removing
    items.filter(item => item.product.id !== cartItem.product.id)
  );
}

}
