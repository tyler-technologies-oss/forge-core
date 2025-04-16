import { expect } from '@esm-bundle/chai';
import { defineCustomElement, getClosestShadowRoot, hasDefinedCustomElement } from '../src/custom-elements/component-utils';
import { CUSTOM_ELEMENT_NAME_PROPERTY } from '../src/custom-elements/constants';

describe('ComponentUtils', () => {
  describe('hasDefinedCustomElement', () => {
  
    class TestCustomElement extends HTMLElement {
      constructor() {
        super();
      }
    }

    it('should return true if custom element is defined', () => {
      window.customElements.define('test-component-that-returns-true-when-checked', TestCustomElement);
      expect(hasDefinedCustomElement('test-component-that-returns-true-when-checked')).to.be.true;
    });

    it('should return false if custom element is not defined', () => {
      expect(hasDefinedCustomElement('test-component-that-returns-false-when-checked')).to.be.false;
    });
  });

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
