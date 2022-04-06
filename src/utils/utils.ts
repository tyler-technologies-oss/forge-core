// https://stackoverflow.com/questions/899574/which-is-best-to-use-typeof-or-instanceof

/**
 * Checks if an object is undefined or null.
 * @param {object} obj The object to test.
 * @returns {boolean}
 */
export function isDefined(obj: any): boolean {
  return typeof obj !== 'undefined' && obj !== null;
}

/**
 * Checks if an object is a string.
 * @param {object} obj The object to test.
 * @returns {boolean}
 */
export function isString(obj: any): obj is string {
  return typeof obj === 'string';
}

/**
 * Checks if an object is a boolean.
 * @param {object} obj The object to test.
 * @returns {boolean}
 */
export function isBoolean(obj: any): obj is boolean {
  return typeof obj === 'boolean';
}

/**
 * Checks if an object is a number.
 * @param {object} obj The object to test.
 * @returns {boolean}
 */
export function isNumber(obj: any): obj is number {
  return typeof obj === 'number';
}

/**
 * Checks if an object is a date.
 * @param {object} obj The object to test.
 * @returns {boolean}
 */
export function isDate(obj: any): obj is Date {
  return obj instanceof Date;
}

/**
 * Checks if an object is a date and is a valid date.
 * @param {object} obj The object to test.
 * @returns {boolean}
 */
export function isValidDate(obj: any): obj is Date {
  if (!isDate(obj)) {
    return false;
  }

  return !isNaN((obj as Date).getTime());
}

/**
 * Checks if an object is a function.
 * @param {object} obj The object to test.
 * @returns {boolean}
 */
export function isFunction(obj: any): boolean {
  return typeof obj === 'function';
}

/**
 * Checks if an object is an array.
 * @param {object} obj The object to test.
 * @returns {boolean}
 */
export function isArray(obj: any): boolean {
  return obj instanceof Array;
}

/**
 * Checks if an object is an object.
 * @param {object} obj The object to test.
 * @returns {boolean}
 */
export function isObject(obj: any): boolean {
  return obj instanceof Object;
}

/**
 * Coerces a string to a boolean.
 * @param {string} value The value to convert.
 * @returns {boolean}
 */
export function coerceBoolean(value: string): boolean {
  return value != null && '' + value !== 'false';
}

/**
 * Coerces a string to a number.
 * @param {string} value The value to convert.
 * @returns {number}
 */
export function coerceNumber(value: string): number {
  return +value;
}

/**
 * Debounce method.
 * @param {function} func The function to call.
 * @param {number} wait The amount of time (milliseconds) to wait.
 * @param {boolean} [immediate=false] Should the callback be executed once immeadiately.
 */
export function debounce(func: any, wait: number, immediate: boolean = false): () => any {
  let context: any;
  let args: any;
  let result: any;
  let timeout: any;
  let timestamp = 0;

  const later: () => void = () => {
    const last = Date.now() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

/**
 * Throttle method.
 * @param {function} func The function to call.
 * @param {number} wait The amount of time (milliseconds) to wait.
 * @param {object=} options An options object with the following properties
 *   <ul>
 *     <li>**leading**: Should the callback be executed once immeadiately.</li>
 *     <li>**trailing**: Should the callback be executed once after the throttle completes.</li>
 *   </ul>
 */
export function throttle(func: any, wait: number, options?: any): () => any {
  let context: any;
  let args: any;
  let result: any;
  let timeout: any;
  let timestamp = 0;

  options = options || {};

  const later: () => void = () => {
    timestamp = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) {
      context = args = null;
    }
  };

  return function() {
    const now = Date.now();
    if (!timestamp && options.leading === false) {
      timestamp = now;
    }
    const remaining = wait - (now - timestamp);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timestamp = now;
      result = func.apply(context, args);
      if (!timeout) {
        context = args = null;
      }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  };
}

/**
 * A minification-safe nameof function for retrieving the name of a property or method at runtime.
 * Note: this function only works with properties/methods on an object. To get the name of a variable,
 *       you will need to wrap it within an object.
 * @param {Function} fn A function the returns a property or method that will be stringified.
 */
export function nameof(fn: () => any): string {
  const fnString = fn.toString();

  // fnString should look something like: function () { return _this.canActivate; }
  // When minified fnString will look something like: function(){return a.canActivate}
  const nameofRegExp = /[^.]\.([^;}\s]+)(?:[;}\s])/; // Get everything after first dot and before the end of the statement
  const match: RegExpExecArray | null = nameofRegExp.exec(fnString);

  if (!match) {
    throw new Error(`Could not parse nameof string: ${fnString}`);
  }

  return match[1];
}
