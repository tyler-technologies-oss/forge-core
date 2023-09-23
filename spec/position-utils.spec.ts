import { OffsetOptions } from '@floating-ui/dom';
import { positionElementAsync } from '@tylertech/forge-core';

interface ITestContext {
  context: ITestPositionUtilsContext;
}

interface ITestPositionUtilsContext {
  element: HTMLElement;
  targetElement: HTMLElement;
  destroy(): void;
}

const viewportOffset = 8; // The browser has 8px of default margin applied

const containerVals = {
  height: 1000,
  width: 1000
};
const targetVals = {
  height: 50,
  width: 50,
  x: 400,
  y: 400
};
const elementVals = {
  height: 200,
  width: 200
};

describe('position-utils', function() {
  describe('positionElementAsync', () => {
    beforeAll(function(this: ITestContext) {
      document.body.style.margin = '0';
      document.documentElement.style.margin = '0';
    });

    afterAll(function(this: ITestContext) {
      document.body.style.removeProperty('margin');
      document.documentElement.style.removeProperty('margin');
    });

    afterEach(function(this: ITestContext) {
      this.context.destroy();
    });

    it('should be visible', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'top', flip: false, shift: false });

      expect(position.visibility).toBe('visible');
    });

    it('should position top', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'top', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe((targetVals.x + (targetVals.width / 2)) - (elementVals.width / 2));
      expect(position.y).withContext('Expected y to be calculated correctly').toBe(targetVals.y - elementVals.height);
    });

    it('should position bottom', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'bottom', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe((targetVals.x + (targetVals.width / 2)) - (elementVals.width / 2));
      expect(position.y).withContext('Expected y to be calculated correctly').toBe(targetVals.y + targetVals.height);
    });

    it('should position left', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'left', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe(targetVals.x - elementVals.width);
      expect(position.y).withContext('Expected y to be calculated correctly').toBe(targetVals.y + (targetVals.height / 2) - (elementVals.height / 2));
    });

    it('should position right', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'right', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe(targetVals.x + targetVals.width);
      expect(position.y).withContext('Expected y to be calculated correctly').toBe(targetVals.y + (targetVals.height / 2) - (elementVals.height / 2));
    });

    it('should position top-start', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'top-start', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe(targetVals.x);
      expect(position.y).withContext('Expected y to be calculated correctly').toBe(targetVals.y - elementVals.height);
    });

    it('should position top-end', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'top-end', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe((targetVals.x + targetVals.width) - elementVals.width);
      expect(position.y).withContext('Expected y to be calculated correctly').toBe(targetVals.y - elementVals.height);
    });

    it('should position left-start', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'left-start', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe(targetVals.x - elementVals.width);
      expect(position.y).withContext('Expected y to be calculated correctly').toBe(targetVals.y);
    });

    it('should position left-end', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'left-end', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe(targetVals.x - elementVals.width);
      expect(position.y).withContext('Expected y to be calculated correctly').toBe((targetVals.y + targetVals.height) - elementVals.height);
    });

    it('should position right-start', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'right-start', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe(targetVals.x + targetVals.width);
      expect(position.y).withContext('Expected y to be calculated correctly').toBe(targetVals.y);
    });

    it('should position right-end', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const position = await positionElementAsync({ element, targetElement, placement: 'right-end', flip: false, shift: false });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe(targetVals.x + targetVals.width);
      expect(position.y).withContext('Expected y to be calculated correctly').toBe((targetVals.y + targetVals.height) - elementVals.height);
    });

    it('should position with offset', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      const offsetOptions: OffsetOptions = { mainAxis: -10, crossAxis: -10 };
      const position = await positionElementAsync({ element, targetElement, placement: 'top', flip: false, shift: false, offset: true, offsetOptions });

      expect(position.x).withContext('Expected x to be calculated correctly').toBe((targetVals.x + (targetVals.width / 2)) - (elementVals.width / 2) + offsetOptions.crossAxis!);
      expect(position.y).withContext('Expected y to be calculated correctly').toBe((targetVals.y - elementVals.height) - offsetOptions.mainAxis!);
    });

    it('should hide when target is not within viewport', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      targetElement.style.left = '200%';
      const position = await positionElementAsync({ element, targetElement, placement: 'right', flip: false, shift: false, hide: true });

      expect(position.visibility).toBe('hidden');
    });

    it('should use translate3d for positioning by default', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      await positionElementAsync({ element, targetElement, placement: 'top', flip: false, shift: false });

      expect(element.style.top).toBe('0px');
      expect(element.style.left).toBe('0px');
      expect(element.style.transform).toContain('translate3d');
    });

    it('should use translate for positioning', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      await positionElementAsync({ element, targetElement, placement: 'top', flip: false, shift: false, translateFunction: 'translate' });

      expect(element.style.top).toBe('0px');
      expect(element.style.left).toBe('0px');
      expect(element.style.transform).toContain('translate');
      expect(element.style.transform).not.toContain('translate3d');
    });

    it('should use top left positioning', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      await positionElementAsync({ element, targetElement, placement: 'top', flip: false, shift: false, transform: false });

      expect(element.style.top).not.toBe('0px');
      expect(element.style.left).not.toBe('0px');
      expect(element.style.transform).not.toContain('translate');
    });

    it('should not apply to element', async function(this: ITestContext) {
      this.context = setupTestContext();
      const { element, targetElement } = this.context;
      await positionElementAsync({ element, targetElement, placement: 'top', flip: false, shift: false, apply: false });

      expect(element.style.top).toBe('');
      expect(element.style.left).toBe('');
      expect(element.style.transform).toBe('');
    });

    describe('should flip', function(this: ITestContext) {
      it('should flip to bottom when no room on top', async function(this: ITestContext) {
        this.context = setupTestContext();
        const { element, targetElement } = this.context;
        targetElement.style.top = '0';
        const position = await positionElementAsync({ element, targetElement, placement: 'top', shift: false, flipOptions: {} });

        expect(position.y).toBe(targetVals.height);
      });
  
      it('should flip to top when no room on bottom', async function(this: ITestContext) {
        this.context = setupTestContext();
        const { element, targetElement } = this.context;
        targetElement.style.top = '100%';
        const position = await positionElementAsync({ element, targetElement, placement: 'bottom', shift: false });

        const bounds = targetElement.getBoundingClientRect();
        expect(position.y).toBe(bounds.y - elementVals.height);
      });
  
      it('should flip to right when no room on left', async function(this: ITestContext) {
        this.context = setupTestContext();
        const { element, targetElement } = this.context;
        targetElement.style.left = '0';
        const position = await positionElementAsync({ element, targetElement, placement: 'left', shift: false, flipOptions: {} });

        const bounds = targetElement.getBoundingClientRect();
        expect(position.x).toBe(bounds.x + targetVals.width);
      });
  
      it('should flip to left when no room on right', async function(this: ITestContext) {
        this.context = setupTestContext();
        const { element, targetElement } = this.context;
        targetElement.style.left = '100%';
        const position = await positionElementAsync({ element, targetElement, placement: 'right', shift: false });

        const bounds = targetElement.getBoundingClientRect();
        expect(position.x).toBe(bounds.x - elementVals.width);
      });
    });

    function setupTestContext(): ITestPositionUtilsContext {
      const container = document.createElement('div');
      container.style.height = `${containerVals.height}px`;
      container.style.width = `${containerVals.width}px`;
      container.style.position = 'relative';
      container.style.overflow = 'auto';
  
      const targetElement = document.createElement('div');
      targetElement.style.height = `${targetVals.height}px`;
      targetElement.style.width = `${targetVals.width}px`;
      targetElement.style.position = 'absolute';
      targetElement.style.top = `${targetVals.y}px`;
      targetElement.style.left = `${targetVals.x}px`;
      container.appendChild(targetElement);
  
      document.body.appendChild(container);
  
      const element = document.createElement('div');
      element.style.height = `${elementVals.height}px`;
      element.style.width = `${elementVals.width}px`;
  
      document.body.appendChild(element);
  
      return {
        element,
        targetElement,
        destroy: () => {
          container.remove();
          element.remove();
        }
      }
    }
  });
});
