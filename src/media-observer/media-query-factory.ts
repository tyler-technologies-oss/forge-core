import { MediaSubscriber } from './media-subscriber';
import { MediaSubscription } from './media-subscription';
import { MediaQueryHandlerFunction, MediaQueryListItem, MediaQuerySubscriberCallback, MediaQueryType } from './types';

export interface IMediaQueryFactory<T> {
  value: T | undefined;
  attach: () => void;
  destroy: () => void;
  subscribe: (callback: MediaQuerySubscriberCallback<T>) => MediaSubscription<T>;
}

export class MediaQueryFactory<T> implements IMediaQueryFactory<T> {
  public value: T | undefined;

  private _queryType: MediaQueryType;
  private _queryParams: T[];
  private _queryLists: MediaQueryListItem[] = [];
  private _subscribers: MediaSubscriber<T>[] = [];

  constructor(queryType: MediaQueryType, queryParams: T[]) {
    this._queryType = queryType;
    this._queryParams = queryParams;
  }

  /** Creates a media query for each param and adds listeners. */
  public attach(): void {
    this._queryLists = this._queryParams.map(param => {
      const queryList = window.matchMedia(`(${this._queryType}: ${param})`);
      const handler: MediaQueryHandlerFunction = (event) => this._next(event, param);

      handler(queryList);
      queryList.addEventListener('change', handler);

      return { queryList, handler };
    });
  }

  /** Removes all listeners, media queries, and subscribers. */
  public destroy(): void {
    for (const queryListItem of this._queryLists) {
      queryListItem.queryList.removeEventListener('change', queryListItem.handler);
    }
    this._queryLists = [];
    this._subscribers = [];
  }

  /** Runs a callback function when a media query is triggered. */
  public subscribe(callback: MediaQuerySubscriberCallback<T>): MediaSubscription<T> {
    const subscriber = new MediaSubscriber(callback);
    this._subscribers.push(subscriber);
    subscriber.next(this.value);
    return new MediaSubscription(subscriber, this._subscribers);
  }

  /** Sets the value and runs all tracked subscriber callbacks. */
  private _next(value: MediaQueryList | MediaQueryListEvent, name: T): void {
    if (!value.matches) {
      return;
    }

    this.value = name;
    for (const subscriber of this._subscribers) {
      subscriber.next(this.value);
    }
  }
}
