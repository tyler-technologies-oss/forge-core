export * from './decorators';
export * from './component-utils';
export * from './constants';

export interface ICustomElement extends HTMLElement {
  initializedCallback?: () => void;
  connectedCallback?: () => void;
  disconnectedCallback?: () => void;
  attributeChangedCallback?: (name: string, oldValue: string, newValue: string) => void;
  adoptedCallback?: () => void;
}

export interface ICustomElementFoundation {
  initialize?: () => void;
  connect?: () => void;
  disconnect?: () => void;
}
