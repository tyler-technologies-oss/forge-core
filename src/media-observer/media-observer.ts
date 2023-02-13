import { MediaQueryFactory } from './media-query-factory';
import { associatedMediaQueryValues, HoverValue, MediaQueryType, PointerValue, PrefersColorSchemeValue, PrefersContrastValue, PrefersReducedMotionValue } from './types';

export interface IMediaObserver {
  anyHover: MediaQueryFactory<HoverValue> | undefined;
  anyPointer: MediaQueryFactory<PointerValue> | undefined;
  hover: MediaQueryFactory<HoverValue> | undefined;
  pointer: MediaQueryFactory<PointerValue> | undefined;
  prefersColorScheme: MediaQueryFactory<PrefersColorSchemeValue> | undefined;
  prefersContrast: MediaQueryFactory<PrefersContrastValue> | undefined;
  prefersReducedMotion: MediaQueryFactory<PrefersReducedMotionValue> | undefined;
  connect: (queryType?: MediaQueryType | MediaQueryType[]) => void;
  disconnect: (queryType?: MediaQueryType | MediaQueryType[]) => void;
}

// TODO: add an observer for window sizes

export class MediaObserver implements IMediaObserver {
  public anyHover: MediaQueryFactory<HoverValue> | undefined;
  public anyPointer: MediaQueryFactory<PointerValue> | undefined;
  public hover: MediaQueryFactory<HoverValue> | undefined;
  public pointer: MediaQueryFactory<PointerValue> | undefined;
  public prefersColorScheme: MediaQueryFactory<PrefersColorSchemeValue> | undefined;
  public prefersContrast: MediaQueryFactory<PrefersContrastValue> | undefined;
  public prefersReducedMotion: MediaQueryFactory<PrefersReducedMotionValue> | undefined;

  public connect(queryType?: MediaQueryType | MediaQueryType[]): void {
    if (!queryType) {
      this._connectAll();
      return;
    }

    if (Array.isArray(queryType)) {
      queryType.forEach(type => this._connectOne(type));
    } else {
      this._connectOne(queryType);
    }
  }

  public disconnect(queryType?: MediaQueryType | MediaQueryType[]): void {
    if (!queryType) {
      this._disconnectAll();
      return;
    }

    if (Array.isArray(queryType)) {
      queryType.forEach(type => this._disconnectOne(type));
    } else {
      this._disconnectOne(queryType);
    }
  }

  private _connectAll(): void {
    this.anyHover = new MediaQueryFactory('any-hover', associatedMediaQueryValues.get('any-hover') as HoverValue[]);
    this.anyPointer = new MediaQueryFactory('any-pointer', associatedMediaQueryValues.get('any-pointer') as PointerValue[]);
    this.hover = new MediaQueryFactory('hover', associatedMediaQueryValues.get('hover') as HoverValue[]);
    this.pointer = new MediaQueryFactory('pointer', associatedMediaQueryValues.get('pointer') as PointerValue[]);
    this.prefersColorScheme = new MediaQueryFactory('prefers-color-scheme', associatedMediaQueryValues.get('prefers-color-scheme') as PrefersColorSchemeValue[]);
    this.prefersContrast = new MediaQueryFactory('prefers-contrast', associatedMediaQueryValues.get('prefers-contrast') as PrefersContrastValue[]);
    this.prefersReducedMotion = new MediaQueryFactory('prefers-reduced-motion', associatedMediaQueryValues.get('prefers-reduced-motion') as PrefersReducedMotionValue[]);

    this.anyHover.attach();
    this.anyPointer.attach();
    this.hover.attach();
    this.pointer.attach();
    this.prefersColorScheme.attach();
    this.prefersContrast.attach();
    this.prefersReducedMotion.attach();
  }

  private _disconnectAll(): void {
    this.anyHover?.destroy();
    this.anyPointer?.destroy();
    this.hover?.destroy();
    this.pointer?.destroy();
    this.prefersColorScheme?.destroy();
    this.prefersContrast?.destroy();
    this.prefersReducedMotion?.destroy();

    this.anyHover = undefined;
    this.anyPointer = undefined;
    this.hover = undefined;
    this.pointer = undefined;
    this.prefersColorScheme = undefined;
    this.prefersContrast = undefined;
    this.prefersReducedMotion = undefined;
  }

  private _connectOne(queryType: MediaQueryType): void {
    switch (queryType) {
      case 'any-hover':
        this.anyHover = new MediaQueryFactory('any-hover', associatedMediaQueryValues.get('any-hover') as HoverValue[]);
        this.anyHover.attach();
        break;
      case 'any-pointer':
        this.anyPointer = new MediaQueryFactory('any-pointer', associatedMediaQueryValues.get('any-pointer') as PointerValue[]);
        this.anyPointer.attach();
        break;
      case 'hover':
        this.hover = new MediaQueryFactory('hover', associatedMediaQueryValues.get('hover') as HoverValue[]);
        this.hover.attach();
        break;
      case 'pointer':
        this.pointer = new MediaQueryFactory('pointer', associatedMediaQueryValues.get('pointer') as PointerValue[]);
        this.pointer.attach();
        break;
      case 'prefers-color-scheme':
        this.prefersColorScheme = new MediaQueryFactory('prefers-color-scheme', associatedMediaQueryValues.get('prefers-color-scheme') as PrefersColorSchemeValue[]);
        this.prefersColorScheme.attach();
        break;
      case 'prefers-contrast':
        this.prefersContrast = new MediaQueryFactory('prefers-contrast', associatedMediaQueryValues.get('prefers-contrast') as PrefersContrastValue[]);
        this.prefersContrast.attach();
        break;
      case 'prefers-reduced-motion':
        this.prefersReducedMotion = new MediaQueryFactory('prefers-reduced-motion', associatedMediaQueryValues.get('prefers-reduced-motion') as PrefersReducedMotionValue[]);
        this.prefersReducedMotion.attach();
        break;
      default:
        break;
    }
  }

  private _disconnectOne(queryType: MediaQueryType): void {
    switch (queryType) {
      case 'any-hover':
        this.anyHover?.destroy();
        this.anyHover = undefined;
        break;
      case 'any-pointer':
        this.anyPointer?.destroy();
        this.anyPointer = undefined;
        break;
      case 'hover':
        this.hover?.destroy();
        this.hover = undefined;
        break;
      case 'pointer':
        this.pointer?.destroy();
        this.pointer = undefined;
        break;
      case 'prefers-color-scheme':
        this.prefersColorScheme?.destroy();
        this.prefersColorScheme = undefined;
        break;
      case 'prefers-contrast':
        this.prefersContrast?.destroy();
        this.prefersContrast = undefined;
        break;
      case 'prefers-reduced-motion':
        this.prefersReducedMotion?.destroy();
        this.prefersReducedMotion = undefined;
        break;
      default:
        break;
    }
  }
}
