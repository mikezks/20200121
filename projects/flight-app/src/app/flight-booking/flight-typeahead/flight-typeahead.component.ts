import { Component, OnInit, OnDestroy } from '@angular/core';
import { timer, Observable, Subscription, Subject, of, zip } from 'rxjs';
import { tap, takeUntil, switchMap, map, debounceTime, filter } from 'rxjs/operators';
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
  
  constructor(private http: HttpClient) { }
  
  ngOnInit() {
    //this.rxjsDemo();

    this.flights$ =
      this.control.valueChanges
        .pipe(
          filter(from => from.length > 2),
          debounceTime(300),
          tap(() => this.loading = true),
          switchMap(from => this.load(from)),
          tap(() => this.loading = false),
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
