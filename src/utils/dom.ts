/**
 * DOM Utilities
 * A collection of framework-agnostic DOM manipulation utilities.
 */

// =============================================================================
// SVG SANITIZER
// =============================================================================

const ALLOWED_ELEMENTS = new Set([
  'svg',
  'path',
  'rect',
  'circle',
  'line',
  'polyline',
  'polygon',
  'g',
]);

const ALLOWED_ATTRIBUTES = new Set([
  'viewbox',
  'width',
  'height',
  'd',
  'x',
  'y',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'transform',
  'opacity',
]);

/**
 * Sanitizes a raw SVG string.
 * Prevents XSS by filtering out dangerous elements and attributes.
 * @param svgContent The raw SVG string to sanitize.
 * @returns A sanitized SVG string.
 */
export function sanitizeSvg(svgContent: string): string {
  if (typeof window === 'undefined') {
    return ''; // SSR safety
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    console.error('SVG Parsing Error:', parserError.textContent);
    return '';
  }

  const sanitizeElement = (el: Element): Node | null => {
    const tagName = el.tagName.toLowerCase();

    if (!ALLOWED_ELEMENTS.has(tagName)) {
      return null;
    }

    const sanitizedEl = document.createElementNS('http://www.w3.org/2000/svg', tagName);

    // Filter attributes
    Array.from(el.attributes).forEach(attr => {
      const attrName = attr.name.toLowerCase();

      // Block on* event handlers and dangerous attributes
      if (attrName.startsWith('on') || attrName === 'href' || attrName === 'xlink:href' || attr.value.trim().toLowerCase().startsWith('javascript:')) {
        return;
      }

      if (ALLOWED_ATTRIBUTES.has(attrName)) {
        sanitizedEl.setAttribute(attr.name, attr.value);
      }
    });

    // Recursively sanitize children
    Array.from(el.childNodes).forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const sanitizedChild = sanitizeElement(child as Element);
        if (sanitizedChild) {
          sanitizedEl.appendChild(sanitizedChild);
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        sanitizedEl.appendChild(document.createTextNode(child.textContent || ''));
      }
    });

    return sanitizedEl;
  };

  const root = doc.documentElement;
  const sanitizedRoot = sanitizeElement(root);

  if (!sanitizedRoot) {
    return '';
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(sanitizedRoot);
}

// =============================================================================
// STRING UTILITIES
// =============================================================================

/**
 * Formats multiple string parts into a single string with spaces.
 * @param first First part of the string.
 * @param middle Middle part of the string.
 * @param last Last part of the string.
 * @returns Formatted string.
 */
export function format(first?: string, middle?: string, last?: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}
