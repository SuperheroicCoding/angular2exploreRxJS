import {Component, HostListener, EventEmitter, AfterViewInit} from '@angular/core';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/count';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/publish';
import '../shared/pausableBuffered';

@Component({
  selector: 'rx-backpressure',
  template: `<div>
      <h1>RxJS Backpressure Example</h1>
      <p>Example to show backpressure with lossy and loss-less pausable observables</p>
  </div>
  <div>
    <p>Lossy Pausable using .pauseableBuffered for mouse movements</p>
    <label for="losslessToggle">Lossless Toggle</label>
    <input (change)="losslessToggleChanged(losslessToggle.checked)" #losslessToggle type="checkbox" checked="losslessToggle$">
    <ul>
      <li *ngFor="let result of pausableMousemoves$ | async">
      {{result}}
      </li>
    </ul>
  </div>`
})
export class BackpressureComponent {


  private mousemove$;
  private losslessToggleSource$;
  private losslessToggle$;

  private countMouseMoves$;
  private pausableMousemoves$;
  private mouseMovedPublished$;

  // noinspection TypeScriptUnresolvedFunction
  constructor() {
    this.mousemove$ = new EventEmitter<MouseEvent>();
    this.losslessToggleSource$ = new EventEmitter();
    this.losslessToggle$ = this.losslessToggleSource$.startWith(true);
    this.mouseMovedPublished$ = this.mousemove$.publish();
    this.countMouseMoves$ = this.mouseMovedPublished$.scan((acc) => acc + 1, 0);

    this.pausableMousemoves$ = this.mouseMovedPublished$
      .do(this.log)
      .map((e) => 'clientX: ' + e.clientX + ', clientY: ' + e.clientY)
      .zip(this.countMouseMoves$, (eventString, count) => 'EventNo: ' + count + ' ' + eventString)
      .pausableBuffered(this.losslessToggle$)
      .scan((previous, item) => [item].concat(previous), []);
      this.mouseMovedPublished$.connect();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove($event) {
    this.mousemove$.emit($event);
  }

  losslessToggleChanged(checked) {
    this.losslessToggleSource$.emit(checked);
  }

  log(x) {
    console.log(x);
  }
}
