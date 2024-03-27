export const CUSTOM_ELEMENT_NAME_PROPERTY = Symbol('Forge custom element tag name');
export const CUSTOM_ELEMENT_DEPENDENCIES_PROPERTY = Symbol('Forge custom element dependencies');

export const CUSTOM_ELEMENT_CSS_PROPERTY = Symbol('Forge element CSS text');
export const CUSTOM_ELEMENT_STYLESHEETS_PROPERTY = Symbol('Forge element CSSStyleSheet instances');

/** Whether the browser supports constructable stylesheets */
export const supportsConstructableStyleSheets = window.__forgeFlags__useConstructableStylesheets !== false &&
                                                window.ShadowRoot &&
                                                'adoptedStyleSheets' in Document.prototype &&
                                                'replace' in CSSStyleSheet.prototype;
