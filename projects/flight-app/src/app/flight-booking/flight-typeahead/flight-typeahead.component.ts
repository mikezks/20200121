import { Component, OnInit, OnDestroy } from '@angular/core';
import { timer, Observable, Subscription, Subject, of, zip, interval, combineLatest, iif } from 'rxjs';
import { tap, takeUntil, switchMap, map, debounceTime, filter, distinctUntilChanged, startWith, share } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-api';
import { HttpParams, HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-flight-typeahead',
  templateUrl: './flight-typeahead.component.html',
  styleUrls: ['./flight-typeahead.component.css']
})
export class FlightTypeaheadComponent implements OnInit, OnDestroy {
  timer$: Observable<number>;
  timerSubscription: Subscription;
  destroy$ = new Subject<boolean>();

  control = new FormControl();
  flights$: Observable<Flight[]>;
  loading: boolean;
  online$: Observable<boolean>;
  online: boolean;
  
  constructor(private http: HttpClient) { }
  
  ngOnInit() {
    //this.rxjsDemo();

    this.online$ = interval(2000)
      .pipe(
        startWith(0),
        map(() => Math.random() < 0.5),
        distinctUntilChanged(),
        //tap(online => this.online = online),
        tap(online => console.log('online', online)),
        share()
      );

    this.flights$ =
      this.control.valueChanges
        .pipe(
          from$ => combineLatest(from$, this.online$),
          filter(([from, online]) => online),
          map(([from, online]) => from),
          distinctUntilChanged(),
          //filter(from => from.length > 2),
          debounceTime(300),
          switchMap(from =>
            iif(
              () => from.length > 2,
              of(from)
                .pipe(
                  tap(() => this.loading = true),
                  switchMap(from => this.load(from)),
                  tap(() => this.loading = false)
                ),
              of([])
            )
          )          
        );
  }

  load(from: string): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';

    const params = new HttpParams()
      .set('from', from);

    const headers = new HttpHeaders()
      .set('Accept', 'application/json');

    const reqObj = {params, headers};
    return this.http.get<Flight[]>(url, reqObj);
  }
  
  rxjsDemo(): void {
    this.timer$ =
      timer(0, 2000)
        .pipe(
          takeUntil(this.destroy$),
          //tap(console.log)
        );
    //this.timerSubscription = this.timer$.subscribe(console.log);

    const name$ = of('Peter', 'Marie', 'Anja');

    this.timer$
      .pipe(
        switchMap(num => name$)
      )
      //.subscribe(console.log);

    zip(
      name$,
      this.timer$
    )
    .pipe(
      map(([name, num]) => name)
    )
    .subscribe(console.log);
  }
  
  ngOnDestroy(): void {
    //this.timerSubscription.unsubscribe();
    //this.destroy$.next(true);
  }
}
