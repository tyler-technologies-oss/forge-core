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
  element: HTMLElement;
  targetElement: HTMLElement;
  placement: PositionPlacement;
  apply?: boolean;
  flip?: boolean;
  shift?: boolean;
  hide?: boolean;
  auto?: boolean;
  offset?: IElementPosition;
  strategy?: PositionStrategy;
  transform?: boolean;
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
  placement,
  offset,
  strategy = 'absolute',
  apply = true,
  flip = true,
  auto = false,
  shift = true,
  hide = true,
  transform = true,
  translateFunction = 'translate3d'
}: IPositionElementConfig): Promise<IElementPositionResult> {
  const middleware: Middleware[] = [];

  // Order of the following middleware items **matters**
  if (offset) {
    middleware.push(positionOffsetMiddleware(offset));
  }
  if (flip && !auto) { // flip and auto placement middleware cannot be used together
    middleware.push(flipMiddleware());
  }
  if (auto) {
    middleware.push(autoPlacementMiddleware());
  }
  if (shift) {
    middleware.push(shiftMiddleware());
  }
  if (hide) {
    middleware.push(hideMiddleware());
  }

  const { x, y, middlewareData } = await computePosition(targetElement, element, { strategy, placement, middleware });
  const visibility = middlewareData.hide?.referenceHidden ? 'hidden' : 'visible';

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
