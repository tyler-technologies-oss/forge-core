import type { Middleware } from '@floating-ui/dom';
import { getContainingBlock } from '@floating-ui/utils/dom';

export const topLayer = (): Middleware => ({
  name: 'topLayer',
  async fn({ x, y, elements: { reference, floating } }) {
    let isTopLayer = false;
    const referenceEl = reference as HTMLElement;
    const diffCoords = { x: 0, y: 0 };

    try {
      isTopLayer = isTopLayer || floating.matches(':popover-open');
    } catch (error) {}
    try {
      isTopLayer = isTopLayer || floating.matches(':open');
    } catch (error) {}
    try {
      isTopLayer = isTopLayer || floating.matches(':modal');
    } catch (error) {}

    if (!isTopLayer) {
      return { x, y, data: diffCoords };
    }

    const containingBlock = getContainingBlock(referenceEl);
    const inContainingBlock = containingBlock && !isWindow(containingBlock);

    if (isTopLayer && inContainingBlock) {
      const rect = referenceEl.getBoundingClientRect();
      diffCoords.x = Math.trunc(rect.x - referenceEl.offsetLeft);
      diffCoords.y = Math.trunc(rect.y - referenceEl.offsetTop);
    }

    return {
      x: x + diffCoords.x,
      y: y + diffCoords.y,
      data: diffCoords
    };
  }
});

function isWindow(value): value is Window {
  return (
    value &&
    value.document &&
    value.location &&
    value.alert &&
    value.setInterval
  );
}
