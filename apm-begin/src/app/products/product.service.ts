import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, map, Observable, of, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';

  /**
   * Old Way
   */
  // constructor(private http: HttpClient) {   

  // }

  //angular 14+
  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService)

  private handleError(err: HttpErrorResponse): Observable<never> { //use keyword never to not omit anything and doesn't complete
    const formattedMessage = this.errorService.formatError(err);
    //return throwError(() => formattedMessage); //rxjs, create a replacement observable
    //OR
    throw formattedMessage; //pure js
  }

  getProductsold(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(() => console.log('In http.get pipeline')),
      catchError(err => {
        console.error(err)
        //return EMPTY;
        return of(ProductData.products);
      })
    );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(() => console.log('In http.get pipeline')),
      catchError(err => this.handleError(err))
    );
  }

  getProductold(id: number): Observable<Product> {
    const productUrl = this.productsUrl + '/' + id;
    return this.http.get<Product>(productUrl).pipe(
      tap(() => console.log('In http.get pipeline for single item'))
    );
  }

  getProduct(id: number): Observable<Product> {
    const productUrl = this.productsUrl + '/' + id;
    return this.http.get<Product>(productUrl)
    .pipe(
      tap(() => console.log('In http.get pipeline for single item')),
      //map(product=>this.getProductionWithRevies(product)), --wont work missing subscribe
      map(product=>this.getProductWithReviews(product)),
      tap(x=> console.log(x)),
      catchError(err=> this.handleError(err))
    );
  }
  
  getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(
          //..product, reviews = iterates product and appends a new property for reviews to the projects making it nested
          map(reviews => ({ ...product, reviews} as Product)) //must be method body instead of object, use the spread operator ... refer to adding a property to the color in blitz
        )
    } else {
      return of(product);
    }
  }


}
