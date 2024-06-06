import { expect } from '@esm-bundle/chai';
import { spy } from 'sinon';
import * as DOMUtils from '../src';
import { tick, timer } from './test-utils';

describe('DOMUtils', () => {
  before(async () => {
    document.documentElement!.style.height = '100%';
    document.documentElement!.style.margin = '0';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
  });

  after(() => {
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

      expect(DOMUtils.getElement<HTMLElement>(document.body, 'div.test-class')).to.equal(element);

      element.remove();
    });
  });

  describe('isElement', () => {
    it('should return true', () => {
      expect(DOMUtils.isElement(document.createElement('div'))).to.be.true;
    });

    it('should return false', () => {
      expect(DOMUtils.isElement(document.createTextNode('test') as any)).to.be.false;
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
      expect(DOMUtils.isPositionStatic(element)).to.be.true;
    });

    it('should return false', () => {
      element.style.position = 'absolute';
      expect(DOMUtils.isPositionStatic(element)).to.be.false;
    });
  });

  describe('parseStyle', () => {
    it('should return 10', () => {
      expect(DOMUtils.parseStyle('10px')).to.equal(10);
    });

    it('should return 0', () => {
      expect(DOMUtils.parseStyle('NaN')).to.equal(0);
      expect(DOMUtils.parseStyle('')).to.equal(0);
    });
  });

  describe('elementIndex', () => {
    it('should return 1', () => {
      const container = document.createElement('div');
      container.appendChild(document.createElement('div'));
      const child = document.createElement('div');
      container.appendChild(child);

      expect(DOMUtils.elementIndex(child)).to.equal(1);

      container.remove();
    });

    it('should return -1', () => {
      expect(DOMUtils.elementIndex(document.documentElement!)).to.equal(-1);
    });
  });

  describe('elementParents', () => {
    let container: HTMLElement;
    let element: HTMLElement;

    before(() => {
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

    after(() => {
      container.remove();
    });

    it('should return 4 parents', () => {
      expect(DOMUtils.elementParents(element).length).to.equal(4);
    });

    it('should return 3 parents', () => {
      expect(DOMUtils.elementParents(element, container).length).to.equal(3);
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
      expect(DOMUtils.offsetParent(element)).to.equal(document.documentElement!);
    });

    it('should return positioned container', () => {
      container.style.position = 'relative';
      expect(DOMUtils.offsetParent(element)).to.equal(container);
    });
  });

  describe('scrollBarWidth', () => {
    it.skip('should be greater than zero', () => {
      expect(DOMUtils.scrollbarWidth()).to.be.greaterThan(0);
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
      expect(DOMUtils.isScrollable(scrollElement)).to.be.false;
    });

    it('should return true', () => {
      scrollElement.style.overflow = 'auto';
      expect(DOMUtils.isScrollable(scrollElement)).to.be.true;
    });
  });

  describe('scrollParent', () => {
    let scrollParent: HTMLElement;
    let scrollChild: HTMLElement;

    before(() => {
      scrollParent = document.createElement('div');
      scrollChild = document.createElement('div');
      scrollParent.appendChild(scrollChild);
      document.body.appendChild(scrollParent);
    });

    after(() => {
      scrollParent.remove();
    });

    it('should return documentElement', () => {
      expect(DOMUtils.scrollParent(document.documentElement!)).to.equal(document.documentElement!);
      expect(DOMUtils.scrollParent(scrollParent)).to.equal(document.documentElement!);
    });

    it('should return scrollable parent', () => {
      scrollParent.style.overflow = 'auto';
      expect(DOMUtils.scrollParent(scrollChild)).to.equal(scrollParent);
      scrollParent.style.overflow = '';
    });

    it('should return self', () => {
      scrollParent.style.overflow = 'auto';
      expect(DOMUtils.scrollParent(scrollParent, true)).to.equal(scrollParent);
      scrollParent.style.overflow = '';
    });

    it('should handle absolute positioning', () => {
      scrollParent.style.position = 'relative';
      scrollChild.style.position = 'absolute';
      expect(DOMUtils.scrollParent(scrollChild)).to.equal(document.documentElement!);
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
      expect(scrollbarVisibility.x).to.equal(false, 'Expected no horizontal scrollbar');
      expect(scrollbarVisibility.y).to.equal(false, 'Expected no vertical scrollbar');
    });

    it('should return true', () => {
      element.style.width = '5000px';
      element.style.height = '5000px';

      const scrollbarVisibility = DOMUtils.isScrollbarVisible(element);
      expect(scrollbarVisibility.x).to.equal(true, 'Expected horizontal scrollbar');
      expect(scrollbarVisibility.y).to.equal(true, 'Expected vertical scrollbar');
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
      expect(offset.top).to.equal(50, 'Expected top to be 50');
      expect(offset.bottom).to.equal(4750, 'Expected bottom to be 4750');
      expect(offset.left).to.equal(75, 'Expected left to be 75');
      expect(offset.right).to.equal(4625, 'Expected right to be 4625');
      expect(offset.height).to.equal(200, 'Expected height to be 200');
      expect(offset.width).to.equal(300, 'Expected width to be 300');

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
      expect(vpOffset.top).to.equal(50 - 1000, 'Expected top to be calculated correctly');
      // scrollTop + rect.height - top - height
      expect(vpOffset.bottom).to.equal(1000 + Math.round(docRect.height) - 50 - 200, 'Expected bottom to be calculated correctly');
      // left - scrollLeft
      expect(vpOffset.left).to.equal(75 - 1000, 'Expected left to be calculated correctly');
      // scrollLeft + rect.width - left - width
      expect(vpOffset.right).to.equal(1000 + Math.round(docRect.width) - 75 - 300, 'Expected right to be calculated correctly');

      vpOffset = DOMUtils.viewportOffset(element, container);
      expect(vpOffset.top).to.equal(50, 'Expected top to be calculated correctly');
      expect(vpOffset.bottom).to.equal(4750, 'Expected bottom to be calculated correctly');
      expect(vpOffset.left).to.equal(75, 'Expected left to be calculated correctly');
      expect(vpOffset.right).to.equal(4625, 'Expected right to be calculated correctly');

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
        expect(DOMUtils.isElementInViewport(childElement)).to.be.true;
      });

      it('should return false', () => {
        document.documentElement!.scrollTop = 201;
        expect(DOMUtils.isElementInViewport(childElement)).to.equal(false, 'Expected element to be out of viewport vertically');
        document.documentElement!.scrollTop = 0;
        document.documentElement!.scrollLeft = 201;
        expect(DOMUtils.isElementInViewport(childElement)).to.equal(false, 'Expected element to be out of viewport horizontally');
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
        expect(DOMUtils.isElementInViewport(element)).to.be.true;
      });

      it('should return false', () => {
        container.scrollTop = 201;
        expect(DOMUtils.isElementInViewport(element)).to.equal(false, 'Expected element to be out of viewport vertically');
        container.scrollTop = 0;
        container.scrollLeft = 201;
        expect(DOMUtils.isElementInViewport(element)).to.equal(false, 'Expected element to be out of viewport horizontally');
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

      expect(container.children.length).to.equal(10, 'Expected 10 children');
      DOMUtils.removeAllChildren(container);
      expect(container.children.length).to.equal(0, 'Expected 0 children');
      container.remove();
    });
  });

  describe('addClass', () => {
    let element: HTMLElement;

    before(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    after(() => {
      element.remove();
    });

    it('should add a class', () => {
      expect(element.classList.contains('class-single')).to.equal(false, 'Expected element not to have class');
      DOMUtils.addClass('class-single', element);
      expect(element.classList.contains('class-single')).to.equal(true, 'Expected element to have class');
    });

    it('should add an array of classes', () => {
      expect(element.classList.contains('class-array-01')).to.equal(false, 'Expected element not to have class');
      expect(element.classList.contains('class-array-02')).to.equal(false, 'Expected element not to have class');
      DOMUtils.addClass(['class-array-01', 'class-array-02'], element);
      expect(element.classList.contains('class-array-01')).to.equal(true, 'Expected element to have class');
      expect(element.classList.contains('class-array-02')).to.equal(true, 'Expected element to have class');
    });
  });

  describe('removeClass', () => {
    let element: HTMLElement;

    before(() => {
      element = document.createElement('div');
      element.classList.add('class-single');
      element.classList.add('class-array-01');
      element.classList.add('class-array-02');
      document.body.appendChild(element);
    });

    after(() => {
      element.remove();
    });

    it('should remove a class', () => {
      expect(element.classList.contains('class-single')).to.equal(true, 'Expected element to have class');
      DOMUtils.removeClass('class-single', element);
      expect(element.classList.contains('class-single')).to.equal(false, 'Expected element not to have class');
    });

    it('should remove an array of classes', () => {
      expect(element.classList.contains('class-array-01')).to.equal(true, 'Expected element to have class');
      expect(element.classList.contains('class-array-02')).to.equal(true, 'Expected element to have class');
      DOMUtils.removeClass(['class-array-01', 'class-array-02'], element);
      expect(element.classList.contains('class-array-01')).to.equal(false, 'Expected element not to have class');
      expect(element.classList.contains('class-array-02')).to.equal(false, 'Expected element not to have class');
    });
  });

  describe('removeElement', () => {
    it('should remove an element', () => {
      const element = document.createElement('div');
      element.classList.add('remove-element');
      document.body.appendChild(element);

      expect(document.querySelectorAll('.remove-element').length).to.equal(1, 'Expected element in DOM');
      DOMUtils.removeElement(element);
      expect(document.querySelectorAll('.remove-element').length).to.equal(0, 'Expected element not to be in DOM');
    });
  });

  describe('safeCssWidth', () => {
    it('should allow for number width', () => {
      expect(DOMUtils.safeCssWidth(100)).to.equal('100px');
    });

    it('should allow for string width', () => {
      expect(DOMUtils.safeCssWidth('100')).to.equal('100px');
    });

    it('should allow for string width as pixels', () => {
      expect(DOMUtils.safeCssWidth('100px')).to.equal('100px');
    });

    it('should allow for string width as percent', () => {
      expect(DOMUtils.safeCssWidth('50%')).to.equal('50%');
    });

    it('should return undefined if string length less than 0', () => {
      expect(DOMUtils.safeCssWidth('-1')).to.be.undefined;
    });

    it('should return undefined if number length less than 0', () => {
      expect(DOMUtils.safeCssWidth(-1)).to.be.undefined;
    });

    it('should return undefined if not number or string', () => {
      expect(DOMUtils.safeCssWidth({} as any)).to.be.undefined;
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

      const cb = spy();
      DOMUtils.ensureChildren(element).then(cb).then(() => {
        expect(cb.calledOnce).to.be.true;
        expect(element.children.length).to.be.greaterThan(0);
        done();
      });
    });

    it('should resolve when the element gets children', done => {
      setTimeout(() => {
        element.appendChild(document.createElement('div'));
      }, 500);

      const cb = spy();
      DOMUtils.ensureChildren(element).then(cb).then(() => {
        expect(cb.calledOnce).to.be.true;
        expect(element.children.length).to.be.greaterThan(0);
        done();
      });
    });

    it('should only resolve once when multiple children have been added', done => {
      setTimeout(() => {
        element.appendChild(document.createElement('div'));
        element.appendChild(document.createElement('div'));
      }, 500);

      const cb = spy();
      DOMUtils.ensureChildren(element).then(cb).then(() => {
        expect(cb.calledOnce).to.be.true;
        expect(element.children.length).to.be.greaterThan(0);
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
      expect(foundInput).to.equal(input);
    });

    it('should resolve when the child is added', async () => {
      const input = document.createElement('input');
      setTimeout(() => {
        element.appendChild(input);
      }, 1000);
      const foundInput = await DOMUtils.ensureChild(element, 'input');
      expect(foundInput).to.equal(input);
    });

    it('should not resolve if child that doesn\'t match selectors is added', async () => {
      await tick();
      element.appendChild(document.createElement('div'));
      const input = document.createElement('input');
      setTimeout(() => element.appendChild(input), 1000);
      const foundInput = await DOMUtils.ensureChild(element, 'input');
      expect(foundInput).to.equal(input);
    });

    it('should not resolve if child is not found', async () => {
      setTimeout(() => element.appendChild(document.createElement('div')), 500);
      const cb = spy();
      DOMUtils.ensureChild(element, 'input').then(cb);
      await timer(1000);
      expect(cb.called).to.be.false;
    });

    it('should take first found element when two matching elements are found', async () => {
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      setTimeout(() => {
        element.appendChild(input1);
        element.appendChild(input2);
      }, 1000);
      const foundInput = await DOMUtils.ensureChild(element, 'input');
      expect(foundInput).to.equal(input1);
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
      expect(DOMUtils.walkUpUntil(element, node => node === document.body)).to.equal(document.body);
    });

    it('should find body element from nested element', () => {
      expect(DOMUtils.walkUpUntil(nestedElement, node => node === document.body)).to.equal(document.body);
    });

    it('should find arbitrary parent element', () => {
      expect(DOMUtils.walkUpUntil(nestedElement, node => node === element)).to.equal(element);
    });

    it('should return null if not found', () => {
      expect(DOMUtils.walkUpUntil(nestedElement, node => (<HTMLElement>node).tagName === 'SOME-RANDOM-TAG')).to.be.null;
    });
  });

  describe('calculateFontWidth', () => {
    it('should return 0 if empty string is provided', () => {
      expect(DOMUtils.calculateFontWidth('')).to.equal(0);
    });

    it('should return font width', () => {
      expect(DOMUtils.calculateFontWidth('Test')).to.be.greaterThan(0);
    });

    it('should accept alternate font size', () => {
      const str = 'Test';
      const first = DOMUtils.calculateFontWidth(str, { fontSize: 14 });
      const second = DOMUtils.calculateFontWidth(str, { fontSize: 12 });
      expect(first).not.to.equal(second);
    });

    it('should accept alternate font family', () => {
      const str = 'Test';
      const first = DOMUtils.calculateFontWidth(str);
      const second = DOMUtils.calculateFontWidth(str, { fontFamily: 'Times New Roman' });
      expect(first).not.to.equal(second);
    });
  });
});
