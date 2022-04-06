/**
 * This method will find a value in a JavaScript object using a string path.
 * Example:
 *   var obj = { one: 1, two: { twoOne: 21, twoTwo: 22, twoThree: [{ threeOne: 31 }] } };
 *   getPropertyValue(obj, 'two.twoOne'); // 21
 *   getPropertyValue(obj, 'one'); // 1
 *   getPropertyValue(obj, 'two.twoThree[0].threeOne'); // 31
 *
 * Inspired by "Alnitak"'s answer on stack overflow:
 * http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
 */
export function getPropertyValue(obj: any, inPath: string): any {
  let path = inPath.replace(/\[(\w+)\]/g, '.$1'); // Convert indexes to properties
  path = path.replace(/^\./, ''); // Strip a leading dot
  const ary = path.split('.');

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < ary.length; ++i) {
    const property = ary[i];
    if (obj && typeof obj === 'object' && property in obj) {
      obj = obj[property];
    } else {
      obj = '';
      break;
    }
  }

  return obj;
}

/**
 * A wrapper around Array.prototype.find to allow for passing in a predicate.
 * @param {any[]} ary The array to search.
 * @param {any} predicate The predicate.
 */
export function findWhere(ary: any[], predicate: any): any {
  return ary.find(item => matchesPredicate(item, predicate));
}

/**
 * A wrapper around Array.prototype.findIndex to allow for passing in a predicate.
 * @param {any[]} ary The array to search.
 * @param {any} predicate The predicate.
 */
export function findIndexWhere(ary: any[], predicate: any): any {
  return ary.findIndex(item => matchesPredicate(item, predicate));
}

/**
 * This function will create a predicate in the form of "{ [property name]: [value] }" where the square brackets are
 * replaced with the actual property name and value for the data.
 */
export function createPredicate(key: string[], data: any): any {
  if (!key || !key.length) {
    throw new Error('Invalid key');
  }

  const predicate: any = {};
  
  for (const propertyName of key) {
    if (Object.prototype.hasOwnProperty.call(data, propertyName)) {
      predicate[propertyName] = data[propertyName];
    } else {
      throw new Error(`Invalid key. The property "${propertyName}" does not exist in the data.`);
    }
  }

  return predicate;
}

/**
 * Determines if an object matches a predicate.
 */
export function matchesPredicate(obj: any, predicate: any): boolean {
  return Object.keys(predicate).every(key => obj[key] === predicate[key]);
}

/**
 * Decorates an object by overriding its property descriptor to add a listener invocation in its dynamically created setter.
 * Note: This does retain existing functionality, and will only work with configurable properties.
 * @param context The `this` context to use for the listener.
 * @param obj The object to decorate.
 * @param prop The property to override.
 * @param listener The listener function that will be executed when the property values changes.
 * @returns A function that can be invoked to return the property to its original property descriptor.
 */
export function listenOwnProperty(context: any, obj: any, prop: string, listener: (value: any) => void): () => void {
  let propObj = obj;
  if (!obj.hasOwnProperty(prop)) {
    propObj = Object.getPrototypeOf(obj);
  }
  const originalValueDescriptor = Object.getOwnPropertyDescriptor(propObj, prop) as PropertyDescriptor;

  if (!originalValueDescriptor) {
    throw new Error(`Property ${prop} does not exist.`);
  }

  Object.defineProperty(obj, prop, {
    configurable: true,
    get() {
      return originalValueDescriptor.get ? originalValueDescriptor.get.apply(this, arguments) : undefined;
    },
    set() {
      if (originalValueDescriptor.set) {
        originalValueDescriptor.set.apply(this, arguments);
      }
      listener.apply(context, arguments);
    }
  });
  
  return () => Object.defineProperty(obj, prop, originalValueDescriptor);
}
