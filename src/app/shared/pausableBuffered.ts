import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/buffer';

declare module 'rxjs/Observable' {
  interface Observable<T> {
    pausableBuffered: (pauseSignal$: Observable<boolean>) => Observable<T>;
  }
}

export function pausableBuffered<T>(pauseSignalObservable) {
  return Observable.create(subscriber => {
    let source: Subject<T> = this;

    let isEnabled = false;
    let closeBuffer = new Subject();
    let bufferIn = new Subject();

    // noinspection TypeScriptUnresolvedFunction
    let buffer = bufferIn.asObservable().buffer(closeBuffer.asObservable());
    buffer.subscribe(bufferedValues => {
      bufferedValues.forEach(val => subscriber.next(val));
    });

    pauseSignalObservable.subscribe(_isEnabled => {
      isEnabled = _isEnabled;
      if (isEnabled) {
        // flush buffer every when stream is enabled
        closeBuffer.next(0);
      }
    });

    let subscription = source.subscribe(value => {
        try {
          if (isEnabled) {
            subscriber.next(value);
          } else {
            bufferIn.next(value);
          }
        } catch (err) {
          subscriber.error(err);
        }
      },
      err => subscriber.error(err),
      () => subscriber.complete());
    return subscription;
  });
}

Observable.prototype.pausableBuffered = pausableBuffered;


