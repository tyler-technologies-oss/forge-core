import { replaceElement, isArray, removeAllChildren, walkUpUntil } from '../utils';

/**
 * Recursively defines a component as a custom elements and all of its dependencies.
 * @param component The component to import.
 */
export function defineCustomElement(component: any): void {
  tryDefine(component._customElementName, component);
  if (isArray(component._customElementDependencies)) {
    defineCustomElements(component._customElementDependencies);
  }
}

/**
 * Defines the specified custom element components.
 * @param {any[]} components The components to register.
 */
export function defineCustomElements(components: any[]): void {
  components.forEach(defineCustomElement);
}

/**
 * Attempts to define the provided custom element name/constructor if not already defined.
 * @param name The name of the custom element to define.
 * @param ctor The custom element constructor.
 */
export function tryDefine(name: string, ctor: CustomElementConstructor, options?: ElementDefinitionOptions | undefined): void {
  if (window?.customElements?.get(name)) {
    return;
  }
  window.customElements.define(name, ctor, options);
}

/**
 * Useful when capturing the value of a unupgraded component during the `connectedCallback` upon upgrade.
 *
 * More information here:
 * https://developers.google.com/web/fundamentals/architecture/building-components/best-practices#lazy-properties
 *
 * @param property
 */
export function upgradeProperty<T extends HTMLElement>(instance: T, property: keyof T): void {
  if (instance.hasOwnProperty(property)) {
    const value = instance[property];
    delete instance[property];
    instance[property] = value;
  }
}

/**
 * Traverses up the DOM tree starting from the provided component element to find the specified parent.
 * @param {HTMLElement} component The starting HTMLElement.
 * @param {string} parentTagName The parent tag name we are searching for.
 */
export function requireParent<T extends HTMLElement>(component: HTMLElement, parentTagName: string): T | null {
  let el = component;

  while (el.parentNode) {
    el = el.parentNode as T;

    if (!el.tagName) {
      break;
    }

    if (!el.tagName || el.tagName.toLowerCase() === parentTagName.toLowerCase()) {
      return el as T;
    }
  }

  return null;
}

/**
 * Creates a template element from a string.
 * @param template The template HTML string.
 */
export function parseTemplateString(template: string): HTMLTemplateElement {
  const templateDocument = new DOMParser().parseFromString(template, 'text/html');
  return templateDocument.querySelector('template') as HTMLTemplateElement;
}

/**
 * Attaches a template to the given web component instance light DOM.
 * @param {T} componentInstance A component instance.
 * @param {string} template The template HTML string.
 */
export function attachLightTemplate<T extends HTMLElement>(componentInstance: T, template: string): void {
  componentInstance.appendChild(parseTemplateString(template).content.cloneNode(true));
}

/**
 * Attaches a shadow root to the given web component instance.
 * @param {T} componentInstance A component instance.
 * @param {string} elementName The name of the element the shadow root is to be attached to.
 * @param {string} template The shadow root template HTML string.
 * @param {string | string[]} styles The shadow root styles string to be encapsulated by this shadow root.
 * @param {boolean} [delegatesFocus=false] Should the component delagate focus.
 */
export function attachShadowTemplate<T extends HTMLElement>(componentInstance: T, template: string, styles?: string | string[], delegatesFocus = false): void {
  const templateElement = prepareShadowTemplate(template, styles);
  componentInstance.attachShadow({ mode: 'open', delegatesFocus });
  setShadowTemplate(componentInstance, templateElement);
}

/**
 * Replaces the template of an existing shadow root with the provided template.
 * @param {T} componentInstance A component instance.
 * @param {string} elementName The name of the element the shadow root is to be attached to.
 * @param {string} template The shadow root template HTML string.
 * @param {string | string[]} styles The shadow root styles string to be encapsulated by this shadow root.
 */
export function replaceShadowTemplate<T extends HTMLElement>(componentInstance: T, template: string, styles?: string | string[]): void {
  if (!componentInstance.shadowRoot) {
    throw new Error('This element does not contain a shadow root. Did you mean to call `attachShadowTemplate`?');
  }

  const templateElement = prepareShadowTemplate(template, styles);

  if ((componentInstance.shadowRoot as ShadowRoot).children.length) {
    removeAllChildren(componentInstance.shadowRoot as any);
  }

  setShadowTemplate(componentInstance, templateElement);
}

/**
 * Creates and prepares an HTML template element for rendering within a shadow root.
 * @param {string} elementName The name of the element the shadow root is to be attached to.
 * @param {string} template The shadow root template HTML string.
 * @param {string | string[]} styles The shadow root styles string to be encapsulated by this shadow root.
 */
export function prepareShadowTemplate(template: string, styles?: string | string[]): HTMLTemplateElement {
  const templateElement = parseTemplateString(template);

  if (styles) {
    styles = styles instanceof Array ? styles : [styles];
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.textContent = styles.join(' ');
    templateElement.content.appendChild(styleElement);
  }

  return templateElement;
}

/**
 * Appends a template to the provided components shadow root.
 * @param {T} componentInstance A component instance.
 * @param {HTMLTemplateElement} templateElement A template element to be cloned.
 */
export function setShadowTemplate<T extends HTMLElement>(componentInstance: T, templateElement: HTMLTemplateElement): void {
  (componentInstance.shadowRoot as ShadowRoot).appendChild(templateElement.content.cloneNode(true));
}

/**
 * Copies style rules from the provided document stylesheets collection to the provided shadow root stylesheet.
 * @param {Document} fromDocument The document to find the style sheets in.
 * @param {ShadowRoot} shadowRoot The shadow root that contains the stylesheet to copy the rules to.
 * @param {IStyleSheetDescriptor[]} styleSheetDescriptors A collection of style sheet predicates.
 * @param {CSSStyleSheet} shadowStyleSheet The shadow root stylesheet to copy the style rules to.
 */
export function provideDocumentStyles(fromDocument: Document, shadowRoot: ShadowRoot, documentStyleSheets: Array<string | IStyleSheetDescriptor>, shadowStyleSheet: CSSStyleSheet): void {
  if (!shadowStyleSheet) {
    return;
  }

  const documentSheets: CSSStyleSheet[] = [];

  documentStyleSheets.forEach(sheet => {
    const sheetName = typeof sheet === 'string' ? sheet : sheet.name;
    const sheetFilter = (sheet as IStyleSheetDescriptor).selectorFilter;
    const matchingStyleSheet = _findMatchingStyleSheet(fromDocument.styleSheets, sheetName);

    if (!matchingStyleSheet) {
      throw new Error(`Could not find stylesheet: ${sheetName}`);
    }

    let startIndex = shadowStyleSheet.cssRules.length;
    for (const rule in matchingStyleSheet.cssRules) {
      if (matchingStyleSheet.cssRules.hasOwnProperty(rule) && matchingStyleSheet.cssRules[rule].cssText && (!sheetFilter || new RegExp(sheetFilter).test((matchingStyleSheet.cssRules[rule] as any).selectorText))) {
        shadowStyleSheet.insertRule(matchingStyleSheet.cssRules[rule].cssText, startIndex++);
      }
    }
  });
}

/**
 * Finds a stylesheet by name in the provided stylesheet list.
 * @param styleSheetList The stylesheet list to search.
 * @param sheetName The stylesheet name to find.
 * @returns {CSSStyleSheet | undefined}
 */
function _findMatchingStyleSheet(styleSheetList: StyleSheetList, sheetName: string): CSSStyleSheet | undefined {
  for (const prop in styleSheetList) {
    if (styleSheetList.hasOwnProperty(prop) && styleSheetList[prop].href) {
      if (new RegExp(sheetName).test(styleSheetList[prop].href as string)) {
        return styleSheetList[prop] as CSSStyleSheet;
      }
    }
  }
  return undefined;
}

/**
 * Gets an HTML element using a query selector from the provided components` shadow root.
 * @param {HTMLElement} componentInstance The component instance that contains a shadow root.
 * @param {string} selector The selector to be passed to `querySelector`.
 */
export function getShadowElement<T extends HTMLElement>(componentInstance: T, selector: string): HTMLElement {
  return (componentInstance.shadowRoot as ShadowRoot).querySelector(selector) as HTMLElement;
}

/**
 * Gets an HTML element using a query selector from the provided components` light DOM.
 * @param {HTMLElement} componentInstance The component instance.
 * @param {string} selector The selector to be passed to `querySelector`.
 */
export function getLightElement<T extends HTMLElement>(componentInstance: T, selector: string): HTMLElement {
  return componentInstance.querySelector(selector) as HTMLElement;
}

/**
 * Creates and dispatches a cross-browser `CustomEvent` with the provided type and data.
 * @param {string} type
 * @param {any} data
 * @param {boolean=} bubble
 */
export function emitEvent<T extends HTMLElement>(component: T, type: string, data: any, bubble = true, cancelable = false): boolean {
  let evt;

  if (typeof CustomEvent === 'function') {
    evt = new CustomEvent(type, {
      detail: data,
      bubbles: bubble,
      cancelable
    } as any);
  } else {
    evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(type, bubble, cancelable, data);
  }

  return component.dispatchEvent(evt);
}

/**
 * Replaces the provided element with a placeholder comment and vice versa.
 * Useful for hiding and showing elements while retaining their location in the DOM.
 * @param {boolean} isVisible Whether the element is visible or not.
 * @param {string} elementName The element tag name.
 * @param {string} selector The selector used to find the element
 * @param {Node} element The element
 * @param {Comment} placeholder The existing placeholder
 */
export function toggleElementPlaceholder(component: HTMLElement, isVisible: boolean, elementName: string, selector: string, element: Node, placeholder: Comment): Comment {
  const exists = !!getShadowElement(component, selector);

  if (!placeholder) {
    placeholder = document.createComment(`(${elementName}) ${selector}`);
  }

  if (isVisible && !exists) {
    replaceElement(element, placeholder);
  } else if (!isVisible && exists) {
    replaceElement(placeholder, element);
  }

  return placeholder;
}

/**
 * Walks up the tree starting a specific node and stops when it finds a shadow root.
 * @param {Node} node The node to start searching from.
 * @returns {ShadowRoot | null} The closest shadow root ancestor, or null if not inside a shadow root.
 */
export function getClosestShadowRoot(node: Node): ShadowRoot | null {
  return walkUpUntil(node, current => current.toString() === '[object ShadowRoot]') as ShadowRoot;
}

/**
 * Finds the closest element up the tree from a starting element across shadow boundaries.
 * @param selector The CSS selector for the element to find.
 * @param startElement The element to start finding from.
 */
export function closestElement(selector: string, startElement: Element): Element | null {
  function __closestFrom(el: Element | Window | Document | null): Element | null {
    if (!el || el === document || el === window) {
      return null;
    }
    if ((el as Slottable).assignedSlot) {
      el = (el as Slottable).assignedSlot;
    }
    const found = (el as Element).closest(selector);
    return found || __closestFrom(((el as Element).getRootNode() as ShadowRoot).host);
  }
  return __closestFrom(startElement);
}

export interface IStyleSheetDescriptor {
  name: string;
  selectorFilter?: string;
}
