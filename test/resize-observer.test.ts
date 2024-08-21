import { expect } from '@esm-bundle/chai';
import { spy } from 'sinon';
import { ForgeResizeObserver } from '../src/resize/resize-observer';

describe('ForgeResizeObserver', () => {
  let element: Element;

  beforeEach(() => {
    ForgeResizeObserver['_targets'].clear();
    ForgeResizeObserver['_observer']?.disconnect();
    ForgeResizeObserver['_observer'] = undefined;

    element = document.createElement('div');
  });

  it('should instantiate the observer when a target is added', () => {
    ForgeResizeObserver.observe(element, () => { });
    expect(ForgeResizeObserver['_observer']).to.be.ok;
  });

  it('should destroy the observer when all targets are removed', () => {
    ForgeResizeObserver.observe(element, () => { });
    ForgeResizeObserver.unobserve(element);
    expect(ForgeResizeObserver['_observer']).to.be.undefined;
  });

  it('should overwrite the callback of a target that is already observed', () => {
    const callbackOne = () => { };
    const callbackTwo = () => { };
    ForgeResizeObserver.observe(element, callbackOne);
    ForgeResizeObserver.observe(element, callbackTwo);
    expect(ForgeResizeObserver['_targets'].size).to.equal(1);
    expect(ForgeResizeObserver['_targets'].get(element)).to.equal(callbackTwo);
  });

  it('should invoke the callback when the target is resized', () => {
    const cb = spy();
    const entry = { target: element } as ResizeObserverEntry;
    ForgeResizeObserver.observe(element, cb);
    ForgeResizeObserver['_handleResize']([entry], ForgeResizeObserver['_observer']!);
    expect(cb.called).to.be.true;
  });
});
