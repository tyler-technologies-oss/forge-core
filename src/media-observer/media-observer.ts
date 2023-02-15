import { Subject } from '../observable';
import { getMediaFeatureValue } from './media-observer-utils';
import { mediaFeatureValues, MediaFeature, MediaQueryListItem, MediaQueryHandler } from './types';

export class MediaObserver<T extends string = MediaFeature, V extends string = string> extends Subject<any> {

  /**
   * STATIC MEMBERS
   */

  /** A Map of all managed media observers. */
  private static _observers: Map<string, MediaObserver<any>> = new Map();

  /** Returns a new media observer tracking the given feature. */
  public static observe<U extends string = MediaFeature>(feature: U, params?: string[], forceNew = false): MediaObserver<any> {
    const existing = MediaObserver._observers.get(feature);
    if (existing && !forceNew) {
      return existing;
    }

    const resolvedParams = params ?? mediaFeatureValues.get(feature) ?? [];
    const observer = new MediaObserver<U>(feature, resolvedParams);
    MediaObserver._observers.set(feature, observer);
    return observer;
  }

  /**
   * INSTANCE MEMBERS
   */

  public feature: T;
  private _params: V[];
  private _queries: MediaQueryListItem[] = [];

  constructor(feature: T, params: V[]) {
    const initialValue = getMediaFeatureValue(feature, params);
    super(initialValue);

    this.feature = feature;
    this._params = params;
    this._attachMediaQueries();
  }

  public destroy(): void {
    for (const item of this._queries) {
      item.query.removeEventListener('change', item.handler);
    }
  }

  private _attachMediaQueries(): void {
    this._queries = this._params.map(param => {
      const query = window.matchMedia(`(${this.feature}: ${param})`);
      const handler: MediaQueryHandler = (event) => this._setValue(event, param);
      handler(query);
      query.addEventListener('change', handler);
      return { query, handler };
    });
  }

  private _setValue(value: MediaQueryList | MediaQueryListEvent, name: V): void {
    if (!value.matches) {
      return;
    }
    this._next(name);
  }
}
