import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, EMPTY, filter, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product, Result } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
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

  //Create a subject for notifications
  // private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  // readonly productSelected$ = this.productSelectedSubject.asObservable();

  //Hold id of the user-selected product as a signal
  selectedProductId = signal<number | undefined>(undefined);

  // getProductsold(): Observable<Product[]> {
  //   return this.http.get<Product[]>(this.productsUrl)
  //   .pipe(
  //     tap(() => console.log('In http.get pipeline')),
  //     catchError(err => {
  //       console.error(err)
  //       //return EMPTY;
  //       return of(ProductData.products);
  //     })
  //   );
  // }

  // getProducts(): Observable<Product[]> {
  //   return this.http.get<Product[]>(this.productsUrl)
  //     .pipe(
  //       tap(() => console.log('In http.get pipeline')),
  //       catchError(err => this.handleError(err))
  //     );
  // }

  //DECLARATIVE APPROACH, prevents from being modified
  //readonly products$ =  this.http.get<Product[]>(this.productsUrl)
  private productsResult$ = this.http.get<Product[]>(this.productsUrl) //toSignal is readonly
    .pipe(
      map(p => ({ data: p, error: undefined } as Result<Product[]>)),
      tap(() => console.log('In http.get pipeline')),
      tap(p => console.log(JSON.stringify(p))),
      shareReplay(1),
      catchError(err =>
        //this.handleError(err)
        of({ 
          data: [], 
          error: this.errorService.formatError(err) 
        } as Result<Product[]>))
    );
  private productsResult = toSignal(this.productsResult$, 
    { initialValue: ({ data: []} as Result<Product[]>) });
  products = computed(() => this.productsResult().data);
  productsError = computed(() => this.productsResult().error);

  // products = computed(() => {
  //   try {
  //     return toSignal(this.products$, { initialValue: [] as Product[]})();
  //   } catch (error) {
  //     return [] as Product[];
  //   }
  // });


  // getProductold(id: number): Observable<Product> {
  //   const productUrl = this.productsUrl + '/' + id;
  //   return this.http.get<Product>(productUrl).pipe(
  //     tap(() => console.log('In http.get pipeline for single item'))
  //   );
  // }

  //higher order operators
  //Use Concat map for order of operations, it waits for each to complete, used for delete, update
  //Mergmap - sets of data no care
  //Switchmap - want to cancel requests at different times

  // getProduct_2Declarative(id: number): Observable<Product> {
  //   const productUrl = this.productsUrl + '/' + id;
  //   return this.http.get<Product>(productUrl)
  //   .pipe(
  //     tap(() => console.log('In http.get pipeline for single item')),

  //     //map(product=>this.getProductionWithRevies(product)), --wont work missing subscribe
  //     switchMap(product=>this.getProductWithReviews(product)),
  //     tap(x=> console.log(x)),
  //     catchError(err=> this.handleError(err))
  //   );
  // }

  //DECLARATIVE APPROACH FOR SINGLE
  // readonly product$ = toObservable(this.selectedProductId) //this.productSelected$ //was a behavior subject
  //   .pipe(
  //     filter(Boolean), //checks for null or undefined
  //     switchMap(id => {
  //       const productUrl = this.productsUrl + '/' + id;
  //       return this.http.get<Product>(productUrl)
  //         .pipe(
  //           tap(() => console.log('In http.get pipeline for single item - DECLARATIVE')),

  //           //map(product=>this.getProductionWithRevies(product)), --wont work missing subscribe
  //           switchMap(product => this.getProductWithReviews(product)),
  //           tap(x => console.log(x)),
  //           catchError(err => this.handleError(err))
  //         );
  //     })
  //   );

  // Find the product in the existing array of products
  private foundProduct = computed(() => {
    // Dependent signals
    const p = this.products();
    const id = this.selectedProductId();
    if (p && id) {
      return p.find(product => product.id === id);
    }
    return undefined;
  })

    //changed to signal
  // Get the related set of reviews
  private productResult$ = toObservable(this.foundProduct)
    .pipe(
      filter(Boolean),
      switchMap(product => this.getProductWithReviews(product)),
      map(p => ({ data: p } as Result<Product>)),
      catchError(err => of({
        data: undefined,
        error: this.errorService.formatError(err)
      } as Result<Product>))
    );

  private productResult = toSignal(this.productResult$);
  product = computed(() => this.productResult()?.data);
  productError = computed(() => this.productResult()?.error);

  //Combining Observables
  // product$ = combineLatest([
  //   this.productSelected$,
  //   this.products$
  // ]).pipe(
  //   //tap(x => x),
  //   map(([selectedProductId, products]) => //js destructuring define var for each arry element
  //     products.find(product => product.id === selectedProductId)
  // ), 
  // filter(Boolean),
  // switchMap(product => this.getProductWithReviews(product)),
  // catchError(err => this.handleError(err))
  // );


  productSelected(selectedProductId: number): void {
    //this.productSelectedSubject.next(selectedProductId);
    this.selectedProductId.set(selectedProductId);
  }

  private getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(
          //..product, reviews = iterates product and appends a new property for reviews to the projects making it nested
          map(reviews => ({ ...product, reviews } as Product)) //must be method body instead of object, use the spread operator ... refer to adding a property to the color in blitz
        )
    } else {
      return of(product);
    }
  }


}


