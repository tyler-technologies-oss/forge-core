import { Observer } from './types';

export class Subject<T> {
  protected _source: T;
  protected _subscribers: Subscription<T>[] = [];
  public get value(): T {
    return this._source;
  }

  constructor(value: T) {
    this._source = value;
  }

  public subscribe(observer?: Observer<T>): Subscription<T> {
    const subscription = new Subscription(this._subscribers, observer);
    this._subscribers.push(subscription);
    observer?.(this._source);
    return subscription;
  }

  protected _next(value: T): void {
    this._source = value;
    for (const subscriber of this._subscribers) {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      subscriber['_observer']?.(value);
    }
  }

  protected _complete(): void {
    this._subscribers = [];
  }
}

export class Subscription<T> {
  private _parent: Subscription<T>[];
  private _observer?: Observer<T>;

  private _closed = false;
  public get closed(): boolean {
    return this._closed;
  };

  constructor(parent: Subscription<T>[], observer?: Observer<T>) {
    this._parent = parent;
    this._observer = observer;
  }

  public unsubscribe(): void {
    if (this._closed) {
      return;
    }

    const index = this._parent.findIndex(subscription => subscription === this);
    if (index > -1) {
      this._parent.splice(index, 1);
      this._closed = true;
      return;
    }

    console.error('Subscription is not present in parent array.', { subscription: this, parent: this._parent });
  }
}
