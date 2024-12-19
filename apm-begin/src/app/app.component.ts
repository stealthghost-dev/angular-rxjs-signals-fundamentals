//import 'zone.js/dist/zone';  // Required for Stackblitz
import { Component, inject } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './cart/cart.service';

//Standalone

@Component({
  selector: 'pm-root',
  standalone: true,
  imports: [RouterLinkActive, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  pageTitle = 'Acme Product Management';

  private cartService = inject(CartService);

  //cartCount = 0;
  cartCount = this.cartService.cartCount;

}
