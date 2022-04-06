import { isFunction } from '../../utils';

export interface ICustomElementConfig {
  /** The name of the custom element tag. */
  name: string;
  /** Components that are dependencies of this component */
  dependencies?: any[];
}

export const CUSTOM_ELEMENT_NAME_PROPERTY = '_customElementName';
export const CUSTOM_ELEMENT_DEPENDENCIES_PROPERTY = '_customElementDependencies';

/**
 * This decorator is intended to be used on classes that extend `HTMLElement` to
 * extend/modify the behavior of a custom element.
 * @param {ICustomElementConfig} [config={}] The custom element configuration.
 */
export function CustomElement(config: ICustomElementConfig): any {
  return (ctor: any) => {
    patchConnectedCallback(ctor);

    if (config.name) {
      ctor[CUSTOM_ELEMENT_NAME_PROPERTY] = config.name;
    }
    
    if (config.dependencies && config.dependencies.length) {
      ctor[CUSTOM_ELEMENT_DEPENDENCIES_PROPERTY] = config.dependencies;
    }
  };
}

function patchConnectedCallback(ctor: any): void {
  const originalConnectedCallback = ctor.prototype.connectedCallback;
  ctor.prototype.connectedCallback = function() {
    if (!this.isConnected) {
      return;
    }
    if (!this._isInitialized) {
      tryUpgradeOwnProperties(this);
      if (isFunction(this.initializedCallback)) {
        this.initializedCallback.apply(this);
      }
      this._isInitialized = true;
    }
    if (isFunction(originalConnectedCallback)) {
      originalConnectedCallback.apply(this);
    }
  };
}

function tryUpgradeOwnProperties(instance: any): void {
  // We ignore our properties that start with an underscore as those are considered "internal"
  // and are not auto-upgraded for us
  const ownProperties = Object.getOwnPropertyNames(instance)
    .filter(p => !p.startsWith('_'));
  for (const property of ownProperties) {
    const value = instance[property];
    delete instance[property];
    instance[property] = value;
  }
}
