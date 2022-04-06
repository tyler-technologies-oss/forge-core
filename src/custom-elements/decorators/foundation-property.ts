interface IComponent extends HTMLElement {
  _foundation?: { [key: string]: any } | undefined;
}

export interface IFoundationPropertyOptions<T> {
  /**
   * Allow Binding to a different naming convention in the foundation
   * @example FoundationProperty({name: '_foo'}) foo;
   */
  name?: string;

  /**
   * When false, skips calling the foundation property setter
   * @default true
   * @example FoundationProperty({set: true}) foo;
   */
  set?: boolean;

  /**
   * When false, skips calling the foundation property getter
   * @default true
   * @example FoundationProperty({get: true}) foo;
   */
  get?: boolean;
}

class FoundationPropertyOptions<T> implements IFoundationPropertyOptions<T> {
  public name: string;
  public get = true;
  public set = true;

  constructor(options?: IFoundationPropertyOptions<T>) {
    if (options) {
      Object.assign(this, options);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const foundationPropertyNotFoundMessage = (className: string, propertyName: string) => `${className}\'s foundation does not contain the property \"${propertyName}\"`;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const foundationNotFoundMessage = (className: string) => `${className} does not have a foundation`;

function runIfVerified(target: IComponent, propertyName: string, action: () => any | void): any {
  if (target._foundation) {
    if (propertyName in target._foundation) {
      return action();
    } else {
      throw new Error(foundationPropertyNotFoundMessage(target.localName, propertyName));
    }
  } else {
    throw new Error(foundationNotFoundMessage(target.localName));
  }
}

export function FoundationProperty<T>(options?: IFoundationPropertyOptions<T>): any {
  const allOptions = new FoundationPropertyOptions(options);

  return (target: IComponent, name: string | symbol, descriptor: PropertyDescriptor | undefined) => {
    let defaultGet: (() => any) | undefined;
    let defaultSet: ((v: any) => void) | undefined;
    const propertyName: string | symbol = name;
    const foundationPropertyName = ((options && options.name) || name).toString();

    if (descriptor) {
      defaultGet = descriptor.get;
      defaultSet = descriptor.set;
      descriptor.configurable = true;
      descriptor.enumerable = true;
      if (allOptions.set) {
        descriptor.set = function(value: any) {
          return wireDescriptorSet(
            this,
            foundationPropertyName,
            attributes => {
              const desc = Object.getOwnPropertyDescriptor(target, foundationPropertyName) as PropertyDescriptor;
              desc.set = attributes.set;
              Reflect.defineProperty(target, propertyName, desc);
              attributes.set(value);
            },
            defaultSet
          );
        };
      }
      if (allOptions.get) {
        descriptor.get = function() {
          return wireDescriptorGet(
            this,
            foundationPropertyName,
            attributes => {
              const desc = Object.getOwnPropertyDescriptor(target, foundationPropertyName) as PropertyDescriptor;
              desc.get = attributes.get;
              Reflect.defineProperty(target, propertyName, desc);
              return attributes.get();
            },
            defaultGet
          );
        };
      }
    } else {
      if (allOptions.set || allOptions.get) {
        const attributes = { configurable: true, enumerable: true };

        const get = {
          get() {
            const that = this;
            return wireDescriptorGet(that, foundationPropertyName, attrs => {
              let setter: any;

              // We have to wire the setter here as well
              if (allOptions.set) {
                setter = { ...set };
              }

              Reflect.defineProperty(that, foundationPropertyName, { configurable: true, enumerable: true, ...attrs, ...setter });
              return attrs.get();
            });
          }
        };

        const set = {
          set(value: any) {
            const that = this;
            return wireDescriptorSet(that, foundationPropertyName, attrs => {
              let getter: any;
              // We have to wire the getter here as well
              if (allOptions.get) {
                getter = { ...get };
              }
              Reflect.defineProperty(that, foundationPropertyName, { configurable: true, enumerable: true, ...attrs, ...getter });
              attrs.set(value);
            });
          }
        };

        if (allOptions.get) {
          Object.assign(attributes, { ...get });
        }

        if (allOptions.set) {
          Object.assign(attributes, { ...set });
        }

        Reflect.defineProperty(target, propertyName, attributes);
      }
    }
  };
}

function setFoundation(target: IComponent, value: any, propertyName: string): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  target._foundation![propertyName] = value;
}

function getFoundation(target: IComponent, propertyName: string): any {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return target._foundation![propertyName];
}

function wireDescriptorSet(target: IComponent, propertyName: string, wireAction: (attributes: { set: (value: any) => void }) => void | any, defaultSet?: (value: any) => void): any {
  let attributes: { set: (value: any) => void };

  if (defaultSet) {
    attributes = {
      set(value: any) {
        defaultSet.call(target, value);
        setFoundation(target, value, propertyName);
      }
    };
  } else {
    attributes = {
      set(value: any) {
        setFoundation(target, value, propertyName);
      }
    };
  }

  return runIfVerified(target, propertyName, () => wireAction(attributes));
}

function wireDescriptorGet(target: IComponent, propertyName: string, wireAction: (attributes: { get: () => any }) => void | any, defaultGet?: () => void): any {
  let attributes: { get: () => any };

  if (defaultGet) {
    attributes = {
      get() {
        defaultGet.call(target);
        return getFoundation(target, propertyName);
      }
    };
  } else {
    attributes = {
      get() {
        return getFoundation(target, propertyName);
      }
    };
  }

  return runIfVerified(target, propertyName, () => wireAction(attributes));
}
