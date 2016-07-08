import { Component, OnInit, EventEmitter, ViewChild, HostListener, ElementRef } from '@angular/core';

import {PhysicsObject} from './physicsObject';

import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/timestamp';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/sample';
import 'rxjs/add/operator/delay'; // for usage in template
import 'rxjs/add/operator/do'; // for usage in template

import 'rxjs/add/observable/interval';
import {Dimensions} from './dimensions';
import {Vector2d} from './vector2d';
import {Mario} from './mario';


@Component({
  moduleId: module.id,
  selector: 'app-mario',
  templateUrl: 'mario.component.html',
  styleUrls: ['mario.component.css']
})
export class MarioComponent implements OnInit {

  @ViewChild('mario', undefined) marioImage: ElementRef;

  private keyDowns$ = new EventEmitter<KeyboardEvent>();
  private keyUps$ = new EventEmitter<KeyboardEvent>();
  private resize$ = new EventEmitter<Window>();
  private dimensions$ = new Observable<Dimensions>();
  private marios$: Observable<Mario>;
  private deltas$: Observable<number>;

  private deltasMovingAverage$: Observable<number>;

  private keyboard$: Observable<number[]>;
  private moveVector$: Observable<Vector2d>;
  private input$: Observable<{dt: number, moveVector: Vector2d}>;


  @HostListener('document:keyup', ['$event'])
  public onKeyUp($event: KeyboardEvent) {
    this.keyUps$.emit($event);
  }

  @HostListener('document:keydown', ['$event'])
  public onKeyDown($event: KeyboardEvent) {
    this.keyDowns$.emit($event);
  }

  @HostListener('window:resize', ['$event.target'])
  public onResize(target: Window) {
    this.resize$.emit(target);
  }

  // compose functions
  compose<T>(...functionsToCompose: Array<(arg: T) => T>): (arg: T) => T {
    return functionsToCompose.slice(0).reduce(
      (f: (t: T) => T, g: (t: T) => T) =>
        (argToApply: T) =>
          f(g(argToApply))
    );
  }

  // update record
  update<T>(r: T, u: Function | any): T {
    return typeof u === 'function' ?
      this.update(r, u(r)) :
      Object.assign({}, r, u);
  }

  // Environment functions
  jump<T extends PhysicsObject>(t) {
    return (m: T) => t.y > 0 && m.y === 0 ? this.update(m, {ay: 7}) : m;
  }

  friction<T extends PhysicsObject>(dt: number) {
    return (m: T) => m.vx !== 0 && m.y === 0 ? this.update(m, {ax: m.ax - ((m.vx / Math.abs(m.vx)) * ( 0.1 * dt))}) : m;
  }

  gravity<T extends PhysicsObject>(dt: number) {
    return (m: T) => m.y > 0 ? this.update(m, {ay: m.ay - dt / 3}) : m;
  }


  physics<T extends PhysicsObject>(dt) {

    return (m: T) => {
      let mAccelerated = this.update(m, {
        vx: m.vx + (m.ax * dt),
        vy: m.vy + (m.ay * dt),
        ax: 0,
        ay: 0
      });
      return this.update(mAccelerated, {
        x: mAccelerated.x + dt * mAccelerated.vx,
        y: Math.max(0, mAccelerated.y + dt * mAccelerated.vy)
      });
    };
  }

  minMax(value: number, upperBound: number, lowerBound?: number) {
    let lowerBoundIntern = (typeof lowerBound === 'undefined') ? -upperBound : lowerBound;
    return Math.max(Math.min(value, upperBound), lowerBoundIntern);
  }

  maxOut(m: Mario) {
    let range = window.innerWidth / 2;
    let x = this.minMax(m.x, (range - 15), -(range + 15));
    let y = this.minMax(m.y, 500, 0);
    let vx = this.minMax(m.vx, 10);
    return this.update(m, {x: x, y: y, vx: vx});
  }


  walk(t) {
    return (m: Mario) => {
      let dir = m.dir;
      if (t.x < 0) {
        dir = 'left';
      } else if (t.x > 0) {
        dir = 'right';
      }
      return (m.y === 0) ? this.update(m, {
        ax: m.ax + t.x,
        dir: dir
      }) : this.update(m, {dir: dir});
    };
  }

  step(dt: number, moveVector: {x: number, y: number}): (mario: Mario) => Mario {
    return this.compose<Mario>(
      this.jump<Mario>(moveVector),
      this.gravity<Mario>(dt),
      this.friction<Mario>(dt),
      this.walk(moveVector),
      (mario: Mario) => this.maxOut(mario),
      this.physics<Mario>(dt));
  }

  // Render
  render(dimensions, mario) {
    let verb = 'stand';
    if (mario.y > 0) {
      verb = 'jump';
    } else if (Math.abs(mario.vx) > 0.1) {
      verb = 'walk';
    }

    let src = 'img/' + verb + '-' + mario.dir + '.gif';

    // gif animations reset on src assignment
    let nativeMarius = this.marioImage.nativeElement;
    if (nativeMarius.name !== src) {
      nativeMarius.src = src;
      nativeMarius.name = src;
    }

    nativeMarius.style.left = (mario.x + dimensions.width / 2) + 'px';
    nativeMarius.style.top = (dimensions.height - 91 - mario.y) + 'px';
  }

  // Elm's FPS
  createFps$(targetFPS: number) {
    return Observable.interval(1000 / targetFPS)
      .timestamp()
      .bufferCount(2, 1)
      .map((w) => w[1].timestamp - w[0].timestamp)
      .share();
  }

  keysBuffer(buffer: [number], e: KeyboardEvent) {
    let result = buffer.slice(0);
    if (e.type === 'keydown') {
      if (buffer.indexOf(e.keyCode) === -1) {
        result.push(e.keyCode);
      }
    } else {
      result = buffer.filter((keyCode: number) => keyCode !== e.keyCode);
    }
    return result;
  }

  // Set up the environment
  ngOnInit() {
    this.dimensions$ =
      this.resize$
        .map((resizedWindow: Window) => new Dimensions(resizedWindow.innerWidth, resizedWindow.innerHeight))
        .share()
        .startWith(new Dimensions(window.innerWidth, window.innerHeight));

    // array of currently pressed keys
    this.keyboard$ = this.keyDowns$
      .merge(this.keyUps$)
      .scan(this.keysBuffer, [])
      .distinctUntilChanged()
      .share().startWith([]);

    // LEFT: 37
    // UP: 38
    // RIGHT: 39
    // UP: 40
    let arrowsMap: Map<number, Vector2d> = new Map<number, Vector2d>();
    arrowsMap.set(37, new Vector2d(-1, 0));
    arrowsMap.set(38, new Vector2d(0, 1));
    arrowsMap.set(39, new Vector2d(1, 0));
    arrowsMap.set(40, new Vector2d(0, 1));

    // Elm's Keyboard.moveVector$
    this.moveVector$ = this.keyboard$.map((keys: [number]) =>
      keys
        .filter((key) => arrowsMap.has(key))
        .reduce((agg, key) => agg.add(arrowsMap.get(key)), Vector2d.ZERO_VECTOR)
    );

    const targetFPS = 60;
    this.deltas$ = this.createFps$(targetFPS).map((t) => t / 20).share();

    // just for debug visualization
    let windowSize = targetFPS;
    this.deltasMovingAverage$ = this.deltas$
      .bufferCount(windowSize, Math.floor(windowSize / 5))
      .map(
        (deltas: number[]) => {
          return deltas.reduce((agg, delta) => agg + (delta / deltas.length), 0);
        }
      );

    this.input$ = this.deltas$.combineLatest(this.moveVector$, (dt: number, moveVector: Vector2d) => {
        return {dt: dt, moveVector: moveVector};
      })
      .sample(this.deltas$).share();

    // mario
    let marioPhys = new Mario(0., 0., 0., 0., 0., 0., 'right');
    this.marios$ = this.input$
      .scan(
        (marioPhysAggr: Mario, c) =>
          this.step(c.dt, c.moveVector)(marioPhysAggr)
        , marioPhys)
      .share();


    this.marios$.combineLatest(this.dimensions$, (nextMario, dimensions) => {
        return {mario: nextMario, dimensions: dimensions};
      }
    ).subscribe(
      (c) => {
        this.render(c.dimensions, c.mario);
      },
      (err) => console.log(err)
    );
  }
}

