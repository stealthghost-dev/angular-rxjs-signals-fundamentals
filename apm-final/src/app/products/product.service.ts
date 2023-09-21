import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, filter, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Result, Product } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private reviewService = inject(ReviewService);

  // private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  // readonly productSelected$ = this.productSelectedSubject.asObservable();

  selectedProductId = signal<number | undefined>(undefined);

  // Get all products
  private productsResult$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      map(p => ({ data: p } as Result<Product[]>)),
      tap(p => console.log(JSON.stringify(p))),
      shareReplay(1),
      catchError(err => of({
        data: [],
        error: this.errorService.formatError(err)
      } as Result<Product[]>))
    );

  private productsResult = toSignal(this.productsResult$, { initialValue: { data: [] } as Result<Product[]> });
  products = computed(() => this.productsResult().data);
  productsErrorMessage = computed(() => this.productsResult().error);

  // Could catch any toSignal error when calling toSignal
  // products = computed(() => {
  //   try {
  //     return toSignal(this.products$, {initialValue: [] as Product[]})();
  //   } catch (e) {
  //     return [] as Product[];
  //   }
  // });

  // Get one product
  private productResult1$ = toObservable(this.selectedProductId)
    .pipe(
      filter(Boolean),
      switchMap(id => {
        const productUrl = this.productsUrl + '/' + id;
        return this.http.get<Product>(productUrl)
          .pipe(
            tap(() => console.log('In http.get by id pipeline')),
            switchMap(product => this.getReviews(product)),
            catchError(err => of({
              data: undefined,
              error: this.errorService.formatError(err)
            } as Result<Product>))
          );
      }),
      map(p => ({ data: p } as Result<Product>))
    );

  private productResult1 = toSignal(this.productResult1$);
  product1 = computed(() => this.productResult1()?.data);
  productErrorMessage1 = computed(() => this.productResult1()?.error);

  // readonly product2$ = combineLatest([
  //   this.productSelected$,
  //   this.products$
  // ]).pipe(
  //   map(([selectedProductId, products]) =>
  //     products.find(product => product.id === selectedProductId)
  //   ),
  //   filter(Boolean),
  //   switchMap(product => this.getReviews(product)),
  //   catchError(err => this.handleError(err))
  // )

  // Finding the product in the existing array of products
  private foundProduct = computed(() => {
    // Dependent signals
    const p = this.products();
    const id = this.selectedProductId();
    if (p && id) {
      return p.find(product => product.id === id);
    }
    return undefined;
  })

  // Getting the related set of reviews
  private productResult$ = toObservable(this.foundProduct)
    .pipe(
      filter(Boolean),
      switchMap(product => this.getReviews(product)),
      map(p => ({ data: p } as Result<Product>)),
      catchError(err => of({
        data: undefined,
        error: this.errorService.formatError(err)
      } as Result<Product>))
    );
  private productResult = toSignal(this.productResult$);
  product = computed(() => this.productResult()?.data);
  productErrorMessage = computed(() => this.productResult()?.error);

  productSelected(selectedProductId: number): void {
    //this.productSelectedSubject.next(selectedProductId);
    this.selectedProductId.set(selectedProductId);
  }

  private getReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(
          map(reviews => ({ ...product, reviews } as Product))
        )
    } else {
      return of(product);
    }
  }

  private errorService = inject(HttpErrorService);

  handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    return throwError(() => formattedMessage);
    //throw formattedMessage;
  }
}
