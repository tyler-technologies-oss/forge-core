import { expect } from '@esm-bundle/chai';
import { getClosestShadowRoot } from '../src';

describe('ComponentUtils', () => {
  describe('getClosestShadowRoot', () => {
    let lightElement: HTMLElement;
    let shadowHostElement: HTMLElement;
    let shadowElement: HTMLElement;
    let nestedShadowElement: HTMLElement;
    let shadowRoot: ShadowRoot;

    beforeEach(() => {
      lightElement = document.createElement('div');
      shadowHostElement = document.createElement('forge-core-test-component');
      shadowRoot = shadowHostElement.attachShadow({ mode: 'open' });
      shadowElement = document.createElement('div');
      nestedShadowElement = document.createElement('div');
      shadowElement.appendChild(nestedShadowElement);
      shadowRoot.appendChild(shadowElement);
    });

    afterEach(() => {
      lightElement.remove();
      shadowElement.remove();
    });

    it('should return null if not inside a shadow root', () => {
      expect(getClosestShadowRoot(lightElement)).to.be.null;
    });

    it('should not return null if inside a shadow root', () => {
      const node = getClosestShadowRoot(shadowElement);
      expect(node).not.to.be.null;
      expect(node).to.equal(shadowRoot);
    });

    it('should find shadow root if nested', () => {
      const node = getClosestShadowRoot(nestedShadowElement);
      expect(node).to.equal(shadowRoot);
    });
  });
});
