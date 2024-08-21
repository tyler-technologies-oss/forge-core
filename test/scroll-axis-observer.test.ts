import { expect } from '@esm-bundle/chai';
import { ScrollAxisObserver, IScrollAxisObserver } from '../src/scroll/scroll-axis-observer';

describe('ScrollAxisObserver', () => {
  let container: HTMLElement;
  let observer: IScrollAxisObserver;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.height = '250px';
    container.style.width = '250px';
    container.style.overflow = 'auto';

    const content = document.createElement('div');
    container.style.height = '500px';
    container.style.width = '500px';

    container.appendChild(content);
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (observer) {
      observer.destroy();
    }
    document.body.removeChild(container);
  });

  it('should throw if no element is provided', () => {
    expect(() => new ScrollAxisObserver(undefined as any)).to.throw();
  });

  // it('should emit scroll event', async () => {
  //   observer = new ScrollAxisObserver(container);
  //   const cb = jasmine.createSpy('callback');
  //   observer.addListener(ScrollEvents.Scroll, cb);
  //   // TODO: Simulate scroll event
  //   expect(cb).toHaveBeenCalledTimes(1);
  // });
});

