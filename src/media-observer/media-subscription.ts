import { MediaSubscriber } from './media-subscriber';

export class MediaSubscription<T> {
  private _subscriber: MediaSubscriber<T>;
  private _owner: MediaSubscriber<T>[];

  constructor(subscriber: MediaSubscriber<T>, owner: MediaSubscriber<T>[]) {
    this._subscriber = subscriber;
    this._owner = owner;
  }

  public unsubscribe(): void {
    const index = this._owner.findIndex(sub => sub === this._subscriber);
    if (index > -1) {
      this._owner.splice(index, 1);
    }
  }
}
