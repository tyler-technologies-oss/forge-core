import { Subject } from '../observable';
import { getBooleanValue, getMatchingValue, getMatchingValues, getRangeQuery, validateName } from './media-observer-utils';
import { BooleanMediaFeature, IMediaObserverOptions, IMediaRange, ManagedMediaQuery, MediaFeature as DiscreteMediaFeature, mediaFeatureValues, MediaQueryHandler, NamedMediaQuery, RangeMediaFeature } from './types';

/**
 * A Subject that tracks the value of a media feature and exposes it synchronously and
 * asynchronously.
 */
export class MediaObserver<T> extends Subject<T> {

  /**
   * STATIC MEMBERS
   */

  /** A collection of all managed media observers. */
  private static _observers: { [key: string]: MediaObserver<any> } = {};

  /** Returns a new media observer tracking a discrete feature. */
  public static observe(feature: DiscreteMediaFeature, options?: IMediaObserverOptions): DiscreteMediaObserver {
    const name = validateName(options?.name) ?? feature;
    const existing = MediaObserver._getObserver<DiscreteMediaObserver, string>(name);
    if (existing && !options?.createNew) {
      return existing;
    }

    return DiscreteMediaObserver.create(feature);
  }

  /** Returns a new media observer tracking a discrete feature. */
  public static observeDiscrete(feature: DiscreteMediaFeature, options?: IMediaObserverOptions): DiscreteMediaObserver {
    return MediaObserver.observe(feature, options);
  }

  /** Returns a new media oberserver tracking a range feature. */
  public static observeRange(feature: RangeMediaFeature, constraints: IMediaRange[], options?: IMediaObserverOptions): RangeMediaObserver {
    const name = validateName(options?.name) ?? feature;
    const existing = MediaObserver._getObserver<RangeMediaObserver, string[]>(name);
    if (existing && !options?.createNew) {
      return existing;
    }

    return RangeMediaObserver.create(feature, constraints, options);
  }

  public static observeBoolean(feature: BooleanMediaFeature, options?: IMediaObserverOptions): BooleanMediaObserver {
    const name = validateName(options?.name) ?? `${feature}-bool`;
    const existing = MediaObserver._getObserver<BooleanMediaObserver, boolean>(name);
    if (existing && !options?.createNew) {
      return existing;
    }

    return BooleanMediaObserver.create(feature, options);
  }

  public static observeCustom(query: string, options?: IMediaObserverOptions): CustomMediaObserver {
    const name = validateName(options?.name) ?? query;
    const existing = MediaObserver._getObserver<CustomMediaObserver, MediaQueryList | MediaQueryListEvent>(name);
    if (existing && !options?.createNew) {
      return existing;
    }

    return CustomMediaObserver.create(query, options);
  }

  private static _getObserver<T extends MediaObserver<U>, U>(name: string): T | undefined {
    const existing = MediaObserver._observers[name];
    if (existing) {
      return existing as T;
    }
    return undefined;
  }

  /**
   * INSTANCE MEMBERS
   */

  private _name: string;
  public get name(): string {
    return this._name;
  }

  private _queries: ManagedMediaQuery[] = [];

  // eslint-disable-next-line @tylertech-eslint/require-private-modifier
  protected constructor(name: string, namedQueries: NamedMediaQuery[], value: T) {
    super(value);
    this._name = name;
    this._queries = this._attachMediaQueries(namedQueries);

    MediaObserver._observers[name] = this;
  }

  /** Removes the `MediaObserver` and all created event listeners. */
  public destroy(): void {
    for (const query of this._queries) {
      query.queryList.removeEventListener('change', query.handler);
    }
    this._queries = [];
    delete MediaObserver._observers[this.name];
  }

  private _attachMediaQueries(namedQueries: NamedMediaQuery[]): ManagedMediaQuery[] {
    return namedQueries.map(({name, query}) => {
      const queryList = window.matchMedia(query);
      const handler: MediaQueryHandler = (event) => this._setValue(event, name);
      handler(queryList);
      queryList.addEventListener('change', handler);
      return { queryList, handler };
    });
  }

  protected _setValue(value: MediaQueryList | MediaQueryListEvent, name: string): void {
    throw new Error('Method not implemented in base class.');
  }
}

/**
 * A media observer that tracks one feature with multiple discrete keyword values.
 */
export class DiscreteMediaObserver extends MediaObserver<string> {
  public static create(feature: DiscreteMediaFeature, options?: IMediaObserverOptions): DiscreteMediaObserver {
    const namedQueries: NamedMediaQuery[] = mediaFeatureValues[feature as keyof typeof mediaFeatureValues].map(featureValue => ({ name: featureValue.toString(), query: `(${name}: ${featureValue})` }));
    const value = getMatchingValue(namedQueries);
    const name = validateName(options?.name) ?? feature;
    return new DiscreteMediaObserver(name, namedQueries, value);
  }

  protected override _setValue(value: MediaQueryList | MediaQueryListEvent, name: string): void {
    if (!value.matches) {
      return;
    }
    this._next(name);
  }
}

/**
 * A media observer that tracks one feature with comparable range values.
 */
export class RangeMediaObserver extends MediaObserver<string[]> {
  public static create(feature: RangeMediaFeature, constraints: IMediaRange[], options?: IMediaObserverOptions): RangeMediaObserver {
    const namedQueries: NamedMediaQuery[] = constraints.map(constraint => ({ query: getRangeQuery(feature, constraint), name: constraint.name }));
    const value = getMatchingValues(namedQueries);
    const name = validateName(options?.name) ?? feature;
    return new RangeMediaObserver(name, namedQueries, value);
  }

  protected override _setValue(value: MediaQueryList | MediaQueryListEvent, name: string): void {
    const index = this._source.indexOf(name);

    if (index === -1 && value.matches) {
      this._next([...this._source, name]);
    } else if (index > -1 && !value.matches) {
      const newSource = [...this._source];
      newSource.splice(index, 1);
      this._next(newSource);
    }
  }
}

/**
 * A media observer that tracks one feature that can be coerced to a boolean value. `none` and 0
 * values evaluate to `true`.
 */
export class BooleanMediaObserver extends MediaObserver<boolean> {
  public static create(feature: BooleanMediaFeature, options?: IMediaObserverOptions): BooleanMediaObserver {
    const namedQuery: NamedMediaQuery[] = [{ query: `(${feature})`, name: '' }];
    const value = getBooleanValue(namedQuery[0]);
    const name = validateName(options?.name) ?? `${feature}-bool`;
    return new BooleanMediaObserver(name, namedQuery, value);
  }

  protected override _setValue(value: MediaQueryList | MediaQueryListEvent, _: never): void {
    this._next(value.matches);
  }
}

/**
 * A media observer that tracks any query.
 */
export class CustomMediaObserver extends MediaObserver<MediaQueryList | MediaQueryListEvent> {
  public static create(query: string, options?: IMediaObserverOptions): CustomMediaObserver {
    const namedQuery: NamedMediaQuery[] = [{ query, name: '' }];
    const value = window.matchMedia(query);
    const name = validateName(options?.name) ?? query;
    return new CustomMediaObserver(name, namedQuery, value);
  }

  protected override _setValue(value: MediaQueryList | MediaQueryListEvent, _: never): void {
    this._next(value);
  }
}
