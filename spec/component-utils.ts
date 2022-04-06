import { getClosestShadowRoot } from '@tylertech/forge-core/custom-elements/component-utils';
import { removeElement } from '@tylertech/forge-core/utils/dom-utils';

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
      removeElement(lightElement);
      removeElement(shadowElement);
    });

    it('should return null if not inside a shadow root', () => {
      expect(getClosestShadowRoot(lightElement)).toBeNull();
    });

    it('should not return null if inside a shadow root', () => {
      const node = getClosestShadowRoot(shadowElement);
      expect(node).not.toBeNull();
      expect(node).toBe(shadowRoot);
    });

    it('should find shadow root if nested', () => {
      const node = getClosestShadowRoot(nestedShadowElement);
      expect(node).toBe(shadowRoot);
    });
  });
});
