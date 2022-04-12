import { Options as FlipOptions } from '@floating-ui/core/src/middleware/flip';
import { Options as AutoOptions } from '@floating-ui/core/src/middleware/autoPlacement';
import { Options as ShiftOptions } from '@floating-ui/core/src/middleware/shift';
import { Options as HideOptions } from '@floating-ui/core/src/middleware/hide';
import {
  computePosition,
  flip as flipMiddleware,
  hide as hideMiddleware,
  shift as shiftMiddleware,
  autoPlacement as autoPlacementMiddleware,
  Middleware,
  Placement,
  Strategy
} from '@floating-ui/dom';

export type PositionPlacement = Placement;
export type PositionStrategy = Strategy;

export interface IElementPosition {
  x: number;
  y: number;
}

export interface IElementPositionResult extends IElementPosition {
  visibility: 'visible' | 'hidden';
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
  autoOptions?: Partial<AutoOptions>;
  /** Offset positioning to apply to the placement. */
  offset?: IElementPosition;
  /** The positioning strategy. */
  strategy?: PositionStrategy;
  /** Should positining be applied using a `transform` style. */
  transform?: boolean;
  /** The CSS `translate` function to apply to the `transform`. Only applied when `transform` is `true`. */
  translateFunction?: 'translate3d' | 'translate';
}

/** Adjusts the x and y axes by a specified offset amount. */
export const positionOffsetMiddleware = ({ x: offsetX, y: offsetY }: IElementPosition): Middleware => ({
  name: 'positionOffset',
  fn({ x, y }) {
    return {
      x: x + offsetX,
      y: y + offsetY
    };
  }
});

/**
 * Calculates an elements position relative to another element.
 * @param {IPositionElementConfig} config Configuration to provide when positioning the element.
 * @returns {IElementPositionResult} The result of the positioning logic.
 */
export async function positionElementAsync({
  element,
  targetElement,
  placement = 'bottom-start',
  offset,
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
  transform = true,
  translateFunction = 'translate3d'
}: IPositionElementConfig): Promise<IElementPositionResult> {
  const middleware: Middleware[] = [];

  // Order of the following middleware is **important**
  if (offset) {
    middleware.push(positionOffsetMiddleware(offset));
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
