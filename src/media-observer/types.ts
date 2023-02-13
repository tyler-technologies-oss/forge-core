export type MediaQueryType = 'any-hover' | 'any-pointer' | 'hover' | 'pointer' | 'prefers-contrast' | 'prefers-color-scheme' | 'prefers-reduced-motion';

export const hoverValues = ['none', 'hover'] as const;
export const pointerValues = ['none', 'coarse', 'fine'] as const;
export const prefersContrastValues = ['no-preference', 'more', 'less', 'custom'] as const;
export const prefersColorSchemeValues = ['light', 'dark'] as const;
export const prefersReducedMotionValues = ['no-preference', 'reduce'] as const;

export type HoverValue = typeof hoverValues[number];
export type PointerValue = typeof pointerValues[number];
export type PrefersContrastValue = typeof prefersContrastValues[number];
export type PrefersColorSchemeValue = typeof prefersColorSchemeValues[number];
export type PrefersReducedMotionValue = typeof prefersReducedMotionValues[number];

export type MediaQueryHandlerFunction = (event: MediaQueryList | MediaQueryListEvent) => void;
export type MediaQueryListItem = { queryList: MediaQueryList, handler: MediaQueryHandlerFunction };
export type MediaQuerySubscriberCallback<T> = (value?: T) => void;

export const associatedMediaQueryValues: Map<MediaQueryType, unknown[]> = new Map([
  ['any-hover', Array.from(hoverValues.values()) as unknown[]],
  ['any-pointer', Array.from(pointerValues.values()) as unknown[]],
  ['hover', Array.from(hoverValues.values()) as unknown[]],
  ['pointer', Array.from(pointerValues.values()) as unknown[]],
  ['prefers-contrast', Array.from(prefersContrastValues.values()) as unknown[]],
  ['prefers-color-scheme', Array.from(prefersColorSchemeValues.values()) as unknown[]],
  ['prefers-reduced-motion', Array.from(prefersReducedMotionValues.values()) as unknown[]]
]);
