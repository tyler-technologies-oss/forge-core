import { MediaFeature } from './types';

/**
 *
 * @param feature A media query feature name.
 * @param params
 * @returns
 */
export function getMediaFeatureValue<T extends string = MediaFeature, V extends string = string>(feature: T, params: V[]): V {
  for (const param of params) {
    const query = window.matchMedia(`(${feature}: ${param})`);
    if (query.matches) {
      return param;
    }
  }
  // We can assume that at least one query will match, this fallback is mostly to satisfy TypeScript
  console.warn(`The ${feature} media feature found no matches, falling back to ${params[0]}.`)
  return params[0];
}
