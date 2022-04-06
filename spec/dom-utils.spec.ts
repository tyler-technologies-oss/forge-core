import * as DOMUtils from '@tylertech/forge-core/utils/dom-utils';
import { tick, timer } from './test-utils';

describe('DOMUtils', () => {
  beforeAll(() => {
    document.documentElement!.style.height = '100%';
    document.documentElement!.style.margin = '0';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
  });

  afterAll(() => {
    document.documentElement!.style.height = '';
    document.documentElement!.style.margin = '';
    document.body.style.height = '';
    document.body.style.margin = '';
  });

  describe('getElement', () => {
    it('should select the element', () => {
      const element = document.createElement('div');
      element.classList.add('test-class');
      document.body.appendChild(element);

      expect(DOMUtils.getElement<HTMLElement>(document.body, 'div.test-class')).toEqual(element);

      element.remove();
    });
  });

  describe('isElement', () => {
    it('should return true', () => {
      expect(DOMUtils.isElement(document.createElement('div'))).toBe(true);
    });

    it('should return false', () => {
      expect(DOMUtils.isElement(document.createTextNode('test') as any)).toBe(false);
    });
  });

  describe('isPositionStatic', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      element.remove();
    });

    it('should return true', () => {
      expect(DOMUtils.isPositionStatic(element)).toBe(true);
    });

    it('should return false', () => {
      element.style.position = 'absolute';
      expect(DOMUtils.isPositionStatic(element)).toBe(false);
    });
  });

  describe('parseStyle', () => {
    it('should return 10', () => {
      expect(DOMUtils.parseStyle('10px')).toBe(10);
    });

    it('should return 0', () => {
      expect(DOMUtils.parseStyle('NaN')).toBe(0);
      expect(DOMUtils.parseStyle('')).toBe(0);
    });
  });

  describe('elementIndex', () => {
    it('should return 1', () => {
      const container = document.createElement('div');
      container.appendChild(document.createElement('div'));
      const child = document.createElement('div');
      container.appendChild(child);

      expect(DOMUtils.elementIndex(child)).toBe(1);

      container.remove();
    });

    it('should return -1', () => {
      expect(DOMUtils.elementIndex(document.documentElement!)).toBe(-1);
    });
  });

  describe('elementParents', () => {
    let container: HTMLElement;
    let element: HTMLElement;

    beforeAll(() => {
      container = document.createElement('div');
      container.id = 'parent-03';

      const parent02 = document.createElement('div');
      const parent01 = document.createElement('div');
      element = document.createElement('div');

      parent01.appendChild(element);
      parent02.appendChild(parent01);
      container.appendChild(parent02);
      document.body.appendChild(container);
    });

    afterAll(() => {
      container.remove();
    });

    it('should return 4 parents', () => {
      expect(DOMUtils.elementParents(element).length).toBe(4);
    });

    it('should return 3 parents', () => {
      expect(DOMUtils.elementParents(element, container).length).toBe(3);
    });
  });

  describe('offsetParent', () => {
    let container: HTMLElement;
    let element: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      element = document.createElement('div');
      container.appendChild(element);
      document.body.appendChild(container);
    });

    afterEach(() => {
      container.remove();
    });

    it('should return document element', () => {
      expect(DOMUtils.offsetParent(element)).toEqual(document.documentElement!);
    });

    it('should return positioned container', () => {
      container.style.position = 'relative';
      expect(DOMUtils.offsetParent(element)).toEqual(container);
    });
  });

  describe('scrollBarWidth', () => {
    it('should be greater than zero', () => {
      expect(DOMUtils.scrollbarWidth()).toBeGreaterThan(0);
    });
  });

  describe('isScrollable', () => {
    let scrollElement: HTMLElement;

    beforeEach(() => {
      scrollElement = document.createElement('div');
      document.body.appendChild(scrollElement);
    });

    afterEach(() => {
      scrollElement.remove();
    });

    it('should return false', () => {
      expect(DOMUtils.isScrollable(scrollElement)).toBe(false);
    });

    it('should return true', () => {
      scrollElement.style.overflow = 'auto';
      expect(DOMUtils.isScrollable(scrollElement)).toBe(true);
    });
  });

  describe('scrollParent', () => {
    let scrollParent: HTMLElement;
    let scrollChild: HTMLElement;

    beforeAll(() => {
      scrollParent = document.createElement('div');
      scrollChild = document.createElement('div');
      scrollParent.appendChild(scrollChild);
      document.body.appendChild(scrollParent);
    });

    afterAll(() => {
      scrollParent.remove();
    });

    it('should return documentElement', () => {
      expect(DOMUtils.scrollParent(document.documentElement!)).toBe(document.documentElement!);
      expect(DOMUtils.scrollParent(scrollParent)).toBe(document.documentElement!);
    });

    it('should return scrollable parent', () => {
      scrollParent.style.overflow = 'auto';
      expect(DOMUtils.scrollParent(scrollChild)).toBe(scrollParent);
      scrollParent.style.overflow = '';
    });

    it('should return self', () => {
      scrollParent.style.overflow = 'auto';
      expect(DOMUtils.scrollParent(scrollParent, true)).toBe(scrollParent);
      scrollParent.style.overflow = '';
    });

    it('should handle absolute positioning', () => {
      scrollParent.style.position = 'relative';
      scrollChild.style.position = 'absolute';
      expect(DOMUtils.scrollParent(scrollChild)).toBe(document.documentElement!);
    });
  });

  describe('isScrollbarVisible', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      element.remove();
    });

    it('should return false', () => {
      const scrollbarVisibility = DOMUtils.isScrollbarVisible(element);
      expect(scrollbarVisibility.x).toBe(false, 'Expected no horizontal scrollbar');
      expect(scrollbarVisibility.y).toBe(false, 'Expected no vertical scrollbar');
    });

    it('should return true', () => {
      element.style.width = '5000px';
      element.style.height = '5000px';

      const scrollbarVisibility = DOMUtils.isScrollbarVisible(element);
      expect(scrollbarVisibility.x).toBe(true, 'Expected horizontal scrollbar');
      expect(scrollbarVisibility.y).toBe(true, 'Expected vertical scrollbar');
    });
  });

  describe('offset', () => {
    it('should measure offset', () => {
      const container = document.createElement('div');
      container.style.height = '5000px';
      container.style.width = '5000px';
      container.style.position = 'relative';

      const element = document.createElement('div');
      element.style.height = '200px';
      element.style.width = '300px';
      element.style.position = 'absolute';
      element.style.top = '50px';
      element.style.left = '75px';

      container.appendChild(element);
      document.body.appendChild(container);

      const offset = DOMUtils.offset(element, container);
      expect(offset.top).toBe(50, 'Expected top to be 50');
      expect(offset.bottom).toBe(4750, 'Expected bottom to be 4750');
      expect(offset.left).toBe(75, 'Expected left to be 75');
      expect(offset.right).toBe(4625, 'Expected right to be 4625');
      expect(offset.height).toBe(200, 'Expected height to be 200');
      expect(offset.width).toBe(300, 'Expected width to be 300');

      container.remove();
    });
  });

  describe('viewportOffset', () => {
    it('should measure viewport offset', () => {
      const container = document.createElement('div');
      container.style.height = '5000px';
      container.style.width = '5000px';
      container.style.position = 'relative';

      const element = document.createElement('div');
      element.style.height = '200px';
      element.style.width = '300px';
      element.style.position = 'absolute';
      element.style.top = '50px';
      element.style.left = '75px';

      container.appendChild(element);
      document.body.appendChild(container);
      document.documentElement!.scrollTop = 1000;
      document.documentElement!.scrollLeft = 1000;

      let vpOffset = DOMUtils.viewportOffset(element);
      const docRect = document.documentElement!.getBoundingClientRect();

      // top - scrollTop
      expect(vpOffset.top).toBe(50 - 1000, 'Expected top to be calculated correctly');
      // scrollTop + rect.height - top - height
      expect(vpOffset.bottom).toBe(1000 + Math.round(docRect.height) - 50 - 200, 'Expected bottom to be calculated correctly');
      // left - scrollLeft
      expect(vpOffset.left).toBe(75 - 1000, 'Expected left to be calculated correctly');
      // scrollLeft + rect.width - left - width
      expect(vpOffset.right).toBe(1000 + Math.round(docRect.width) - 75 - 300, 'Expected right to be calculated correctly');

      vpOffset = DOMUtils.viewportOffset(element, container);
      expect(vpOffset.top).toBe(50, 'Expected top to be calculated correctly');
      expect(vpOffset.bottom).toBe(4750, 'Expected bottom to be calculated correctly');
      expect(vpOffset.left).toBe(75, 'Expected left to be calculated correctly');
      expect(vpOffset.right).toBe(4625, 'Expected right to be calculated correctly');

      container.remove();
      document.documentElement!.scrollTop = 0;
      document.documentElement!.scrollLeft = 0;
    });
  });

  describe('isElementInViewport', () => {
    let container: HTMLElement;
    let childElement: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      container.style.height = '5000px';
      container.style.width = '5000px';

      childElement = document.createElement('div');
      childElement.style.height = '200px';
      childElement.style.width = '200px';

      container.appendChild(childElement);
      document.body.appendChild(container);
    });

    afterEach(() => {
      container.remove();
    });

    describe('it should handle the documentElement as the scroll parent', () => {
      it('should return true', () => {
        document.documentElement!.scrollTop = 50;
        document.documentElement!.scrollLeft = 50;
        expect(DOMUtils.isElementInViewport(childElement)).toBe(true);
      });

      it('should return false', () => {
        document.documentElement!.scrollTop = 201;
        expect(DOMUtils.isElementInViewport(childElement)).toBe(false, 'Expected element to be out of viewport vertically');
        document.documentElement!.scrollTop = 0;
        document.documentElement!.scrollLeft = 201;
        expect(DOMUtils.isElementInViewport(childElement)).toBe(false, 'Expected element to be out of viewport horizontally');
        document.documentElement!.scrollLeft = 0;
      });
    });

    describe('it should handle the parentElement as the scroll parent', () => {
      let element: HTMLElement;

      beforeEach(() => {
        document.documentElement!.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        container.style.overflow = 'auto';
        container.style.height = '100%';
        container.style.width = '';
        childElement.style.height = '5000px';
        childElement.style.width = '5000px';

        element = document.createElement('div');
        element.style.height = '200px';
        element.style.width = '200px';
        childElement.appendChild(element);
      });

      afterEach(() => {
        document.documentElement!.style.overflow = '';
        document.body.style.overflow = '';
      });

      it('should return true', () => {
        container.scrollTop = 50;
        container.scrollLeft = 50;
        expect(DOMUtils.isElementInViewport(element)).toBe(true);
      });

      it('should return false', () => {
        container.scrollTop = 201;
        expect(DOMUtils.isElementInViewport(element)).toBe(false, 'Expected element to be out of viewport vertically');
        container.scrollTop = 0;
        container.scrollLeft = 201;
        expect(DOMUtils.isElementInViewport(element)).toBe(false, 'Expected element to be out of viewport horizontally');
        container.scrollLeft = 0;
      });
    });
  });

  describe('removeAllChildren', () => {
    it('should remove children', () => {
      const container = document.createElement('div');

      for (let i = 0; i < 10; i++) {
        const element = document.createElement('div');
        container.appendChild(element);
      }

      expect(container.children.length).toBe(10, 'Expected 10 children');
      DOMUtils.removeAllChildren(container);
      expect(container.children.length).toBe(0, 'Expected 0 children');
      container.remove();
    });
  });

  describe('addClass', () => {
    let element: HTMLElement;

    beforeAll(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterAll(() => {
      element.remove();
    });

    it('should add a class', () => {
      expect(element.classList.contains('class-single')).toBe(false, 'Expected element not to have class');
      DOMUtils.addClass('class-single', element);
      expect(element.classList.contains('class-single')).toBe(true, 'Expected element to have class');
    });

    it('should add an array of classes', () => {
      expect(element.classList.contains('class-array-01')).toBe(false, 'Expected element not to have class');
      expect(element.classList.contains('class-array-02')).toBe(false, 'Expected element not to have class');
      DOMUtils.addClass(['class-array-01', 'class-array-02'], element);
      expect(element.classList.contains('class-array-01')).toBe(true, 'Expected element to have class');
      expect(element.classList.contains('class-array-02')).toBe(true, 'Expected element to have class');
    });
  });

  describe('removeClass', () => {
    let element: HTMLElement;

    beforeAll(() => {
      element = document.createElement('div');
      element.classList.add('class-single');
      element.classList.add('class-array-01');
      element.classList.add('class-array-02');
      document.body.appendChild(element);
    });

    afterAll(() => {
      element.remove();
    });

    it('should remove a class', () => {
      expect(element.classList.contains('class-single')).toBe(true, 'Expected element to have class');
      DOMUtils.removeClass('class-single', element);
      expect(element.classList.contains('class-single')).toBe(false, 'Expected element not to have class');
    });

    it('should remove an array of classes', () => {
      expect(element.classList.contains('class-array-01')).toBe(true, 'Expected element to have class');
      expect(element.classList.contains('class-array-02')).toBe(true, 'Expected element to have class');
      DOMUtils.removeClass(['class-array-01', 'class-array-02'], element);
      expect(element.classList.contains('class-array-01')).toBe(false, 'Expected element not to have class');
      expect(element.classList.contains('class-array-02')).toBe(false, 'Expected element not to have class');
    });
  });

  describe('removeElement', () => {
    it('should remove an element', () => {
      const element = document.createElement('div');
      element.classList.add('remove-element');
      document.body.appendChild(element);

      expect(document.querySelectorAll('.remove-element').length).toBe(1, 'Expected element in DOM');
      DOMUtils.removeElement(element);
      expect(document.querySelectorAll('.remove-element').length).toBe(0, 'Expected element not to be in DOM');
    });
  });

  describe('safeCssWidth', () => {
    it('should allow for number width', () => {
      expect(DOMUtils.safeCssWidth(100)).toBe('100px');
    });

    it('should allow for string width', () => {
      expect(DOMUtils.safeCssWidth('100')).toBe('100px');
    });

    it('should allow for string width as pixels', () => {
      expect(DOMUtils.safeCssWidth('100px')).toBe('100px');
    });

    it('should allow for string width as percent', () => {
      expect(DOMUtils.safeCssWidth('50%')).toBe('50%');
    });

    it('should return undefined if string length less than 0', () => {
      expect(DOMUtils.safeCssWidth('-1')).toBeUndefined();
    });

    it('should return undefined if number length less than 0', () => {
      expect(DOMUtils.safeCssWidth(-1)).toBeUndefined();
    });

    it('should return undefined if not number or string', () => {
      expect(DOMUtils.safeCssWidth({} as any)).toBeUndefined();
    });
  });

  describe('ensureChildren', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
      element = undefined as any;
    });

    it('should resolve when the element already has children', done => {
      element.appendChild(document.createElement('div'));

      const cb = jasmine.createSpy('callback');
      DOMUtils.ensureChildren(element).then(cb).then(() => {
        expect(cb).toHaveBeenCalled();
        expect(element.children.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should resolve when the element gets children', done => {
      setTimeout(() => {
        element.appendChild(document.createElement('div'));
      }, 500);

      const cb = jasmine.createSpy('callback');
      DOMUtils.ensureChildren(element).then(cb).then(() => {
        expect(cb).toHaveBeenCalled();
        expect(element.children.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should only resolve once when multiple children have been added', done => {
      setTimeout(() => {
        element.appendChild(document.createElement('div'));
        element.appendChild(document.createElement('div'));
      }, 500);

      const cb = jasmine.createSpy('callback');
      DOMUtils.ensureChildren(element).then(cb).then(() => {
        expect(cb).toHaveBeenCalledTimes(1);
        expect(element.children.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('ensureChild', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
      element = undefined as any;
    });

    it('should resolve when the child already exists', async () => {
      const input = document.createElement('input');
      element.appendChild(input);
      const foundInput = await DOMUtils.ensureChild(element, 'input');
      expect(foundInput).toEqual(input);
    });

    it('should resolve when the child is added', async () => {
      const input = document.createElement('input');
      setTimeout(() => {
        element.appendChild(input);
      }, 1000);
      const foundInput = await DOMUtils.ensureChild(element, 'input');
      expect(foundInput).toEqual(input);
    });

    it('should not resolve if child that doesn\'t match selectors is added', async () => {
      await tick();
      element.appendChild(document.createElement('div'));
      const input = document.createElement('input');
      setTimeout(() => element.appendChild(input), 1000);
      const foundInput = await DOMUtils.ensureChild(element, 'input');
      expect(foundInput).toEqual(input);
    });

    it('should not resolve if child is not found', async () => {
      setTimeout(() => element.appendChild(document.createElement('div')), 500);
      const cb = jasmine.createSpy('callback');
      DOMUtils.ensureChild(element, 'input').then(cb);
      await timer(1000);
      expect(cb).not.toHaveBeenCalled();
    });

    it('should take first found element when two matching elements are found', async () => {
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      setTimeout(() => {
        element.appendChild(input1);
        element.appendChild(input2);
      }, 1000);
      const foundInput = await DOMUtils.ensureChild(element, 'input');
      expect(foundInput).toEqual(input1);
    });
  });

  describe('walkUpUntil', () => {
    let element: HTMLElement;
    let nestedElement: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      nestedElement = document.createElement('div');
      element.appendChild(nestedElement);
      document.body.appendChild(element);
    });

    afterEach(() => {
      DOMUtils.removeElement(element);
    });

    it('should find body element', () => {
      expect(DOMUtils.walkUpUntil(element, node => node === document.body)).toBe(document.body);
    });

    it('should find body element from nested element', () => {
      expect(DOMUtils.walkUpUntil(nestedElement, node => node === document.body)).toBe(document.body);
    });

    it('should find arbitrary parent element', () => {
      expect(DOMUtils.walkUpUntil(nestedElement, node => node === element)).toBe(element);
    });

    it('should return null if not found', () => {
      expect(DOMUtils.walkUpUntil(nestedElement, node => (<HTMLElement>node).tagName === 'SOME-RANDOM-TAG')).toBeNull();
    });
  });

  describe('calculateFontWidth', () => {
    it('should return 0 if empty string is provided', () => {
      expect(DOMUtils.calculateFontWidth('')).toBe(0);
    });

    it('should return font width', () => {
      expect(DOMUtils.calculateFontWidth('Test')).toBeGreaterThan(0);
    });

    it('should accept alternate font size', () => {
      const str = 'Test';
      const first = DOMUtils.calculateFontWidth(str, { fontSize: 14 });
      const second = DOMUtils.calculateFontWidth(str, { fontSize: 12 });
      expect(first).not.toEqual(second);
    });

    it('should accept alternate font family', () => {
      const str = 'Test';
      const first = DOMUtils.calculateFontWidth(str);
      const second = DOMUtils.calculateFontWidth(str, { fontFamily: 'Times New Roman' });
      expect(first).not.toEqual(second);
    });
  });
});
