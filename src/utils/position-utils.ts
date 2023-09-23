import {
  computePosition,
  flip as flipMiddleware,
  hide as hideMiddleware,
  shift as shiftMiddleware,
  offset as offsetMiddleware,
  FlipOptions,
  ShiftOptions,
  AutoPlacementOptions,
  HideOptions,
  autoPlacement as autoPlacementMiddleware,
  Middleware,
  Placement,
  Strategy,
  OffsetOptions
} from '@floating-ui/dom';
import { getContainingBlock } from '@floating-ui/utils/dom';
import { topLayer as topLayerMiddleware } from './top-layer-middleware';

export type PositionPlacement = Placement;
export type PositionStrategy = Strategy;

export interface IElementPositionResult {
  visibility: 'visible' | 'hidden';
  x: number;
  y: number;
}

export interface IPositionElementConfig {
  /** The element to apply position to. */
  element: HTMLElement;
  /** The target element to position `element` around. */
  targetElement: HTMLElement;
  /** The placement position. */
  placement: PositionPlacement;
  /** Whether the position values should be applied to the `element` or not. Default is `true`. */
  apply?: boolean;
  /** Should the element flip to the opposite placement when not enough room. */
  flip?: boolean;
  /** Options to provide to the flip middleware. */
  flipOptions?: Partial<FlipOptions>;
  /** Should the element stay visible at the same placement when scrolling. */
  shift?: boolean;
  /** Options to provide to the shift middleware. */
  shiftOptions?: Partial<ShiftOptions>;
  /** Should the element hide itself when the target element is out of the view. */
  hide?: boolean;
  /** Options to provide to the hide middleware. */
  hideOptions?: Partial<HideOptions>;
  /** Should the element automatically attempt to locate the best placement, */
  auto?: boolean;
  /** Options to provide to the autoPlacement middleware. */
  autoOptions?: Partial<AutoPlacementOptions>;
  /** Should any offset values be applied to the element. */
  offset?: boolean;
  /**  */
  offsetOptions?: Partial<OffsetOptions>;
  /** Should the top-layer middleware be applied or not. */
  topLayer?: boolean;
  /** The positioning strategy. */
  strategy?: PositionStrategy;
  /** Should positioning be applied using a `transform` style. */
  transform?: boolean;
  /** The CSS `translate` function to apply to the `transform`. Only applied when `transform` is `true`. */
  translateFunction?: 'translate3d' | 'translate';
}

/**
 * Calculates an elements position relative to another element.
 * @param {IPositionElementConfig} config Configuration to provide when positioning the element.
 * @returns {IElementPositionResult} The result of the positioning logic.
 */
export async function positionElementAsync({
  element,
  targetElement,
  placement = 'bottom-start',
  offset = false,
  offsetOptions,
  strategy = 'absolute',
  apply = true,
  flip = true,
  flipOptions = {
    fallbackPlacements: ['top-start', 'top', 'top-end', 'left-start', 'left', 'left-end', 'right-start', 'right', 'right-end'],
    fallbackStrategy: 'initialPlacement'
  },
  auto = false,
  autoOptions,
  shift = true,
  shiftOptions,
  hide = false,
  hideOptions,
  topLayer = false,
  transform = true,
  translateFunction = 'translate3d'
}: IPositionElementConfig): Promise<IElementPositionResult> {
  const middleware: Middleware[] = [];

  // Order of the following middleware is **important**
  if (offset) {
    middleware.push(offsetMiddleware(offsetOptions));
  }
  if (shift) {
    middleware.push(shiftMiddleware(shiftOptions));
  }
  if (flip && !auto) { // flip and auto placement middleware cannot be used together
    middleware.push(flipMiddleware(flipOptions));
  }
  if (auto) {
    middleware.push(autoPlacementMiddleware(autoOptions));
  }
  if (hide) {
    middleware.push(hideMiddleware(hideOptions));
  }
  if (topLayer) {
    middleware.push(topLayerMiddleware());
  }

  const { x, y, middlewareData } = await computePosition(targetElement, element, { strategy, placement, middleware });
  const visibility = middlewareData.hide?.referenceHidden ? 'hidden' : 'visible';

  // Should we apply the position information to the element?
  if (apply) {
    const styles: Partial<CSSStyleDeclaration> = {
      left: transform ? '0' : `${x}px`,
      top: transform ? '0' : `${y}px`,
      visibility
    };
    
    if (transform) {
      if (translateFunction === 'translate') {
        styles.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      } else {
        styles.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      }
    }

    Object.assign(element.style, styles);
  }

  return { x, y, visibility };
}

/**
 * Determines if the provided element is a child of a containment block.
 * @param element The element to check.
 * @returns {boolean} `true` if the element is within a containment block, otherwise `false`.
 */
export function isWithinContainingBlock(element: Element): boolean {
  return Boolean(getContainingBlock(element));
}
