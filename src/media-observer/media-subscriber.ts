import { MediaQuerySubscriberCallback } from './types';

export class MediaSubscriber<T> {
  private _callback: MediaQuerySubscriberCallback<T>;

  constructor(callback: MediaQuerySubscriberCallback<T>) {
    this._callback = callback;
  }

  public next(value?: T): void {
    this._callback(value);
  }
}
