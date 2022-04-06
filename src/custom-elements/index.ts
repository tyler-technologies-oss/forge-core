export * from './decorators';
export * from './component-utils';

export interface ICustomElement extends HTMLElement {
  initializedCallback?: () => void;
  connectedCallback?: () => void;
  disconnectedCallback?: () => void;
  attributeChangedCallback?: (name: string, oldValue: string, newValue: string) => void;
}

export interface ICustomElementFoundation {
  initialize?: () => void;
  connect?: () => void;
  disconnect?: () => void;
}
