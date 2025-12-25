/**
 * Clipboard Paste Plugin - CKEditor-inspired Implementation
 * 
 * Handles pasting content from Microsoft Word, RTF, and other rich text sources.
 * Implements a multi-stage cleaning pipeline similar to CKEditor 5's approach:
 * 
 * 1. Pre-processing: Remove comments, scripts, style tags
 * 2. Structural cleaning: Convert Word-specific elements to standard HTML
 * 3. Style normalization: Extract and normalize inline styles
 * 4. List conversion: Convert Word's pseudo-lists to proper HTML lists
 * 5. Table handling: Clean up Word tables
 * 6. Final cleanup: Remove empty elements and normalize whitespace
 */

import { Plugin, PluginKey } from 'prosemirror-state';
import { Slice } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

export const clipboardPastePluginKey = new PluginKey('clipboardPaste');

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Word-specific class patterns to remove
 */
const WORD_CLASS_PATTERNS = [
    /^Mso/i,
    /^xl\d+$/i,
    /^font\d+$/i,
    /^TableNormal$/i,
    /^ListParagraph$/i,
];

/**
 * Tags to completely remove (including content)
 */
const REMOVE_TAGS = new Set([
    'meta', 'link', 'script', 'style', 'title', 'xml',
    'o:p', 'o:smarttagtype', 'o:documentproperties',
    'w:worddocument', 'w:latentstyles', 'w:sdtpr',
    'v:shapetype', 'v:shape', 'v:imagedata', 'v:formulas', 'v:path',
    '!doctype', 'html', 'head', 'body'
]);

/**
 * Tags that should be unwrapped (keep content, remove tag)
 */
const UNWRAP_TAGS = new Set([
    'font', 'center', 'o:lock', 'v:stroke', 'v:fill',
    'st1:personname', 'st1:city', 'st1:country-region',
]);

/**
 * Windows system colors to RGB mapping
 */
const SYSTEM_COLORS: Record<string, string> = {
    'windowtext': '#000000',
    'window': '#ffffff',
    'buttonface': '#f0f0f0',
    'buttonhighlight': '#ffffff',
    'buttonshadow': '#a0a0a0',
    'captiontext': '#000000',
    'graytext': '#808080',
    'highlight': '#0078d7',
    'highlighttext': '#ffffff',
    'inactiveborder': '#f4f7fc',
    'inactivecaption': '#ffffff',
    'inactivecaptiontext': '#000000',
    'infobackground': '#ffffe1',
    'infotext': '#000000',
    'menu': '#f0f0f0',
    'menutext': '#000000',
    'scrollbar': '#c8c8c8',
    'threeddarkshadow': '#a0a0a0',
    'threedface': '#f0f0f0',
    'threedhighlight': '#ffffff',
    'threedlightshadow': '#e3e3e3',
    'threedshadow': '#a0a0a0',
    'background': '#ffffff',
    'activeborder': '#b4b4b4',
    'black': '#000000',
    'white': '#ffffff',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parses CSS color value to a standardized hex format
 */
function normalizeColor(color: string | null | undefined): string | null {
    if (!color) return null;

    const trimmed = color.trim().toLowerCase();

    // Skip non-colors
    if (!trimmed || trimmed === 'transparent' || trimmed === 'inherit' ||
        trimmed === 'initial' || trimmed === 'none' || trimmed === 'auto') {
        return null;
    }

    // Handle Windows system colors
    if (SYSTEM_COLORS[trimmed]) {
        return SYSTEM_COLORS[trimmed];
    }

    // Already hex
    if (trimmed.startsWith('#')) {
        // Expand shorthand (#abc -> #aabbcc)
        if (trimmed.length === 4) {
            return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
        }
        return trimmed;
    }

    // Parse rgb/rgba
    const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
        const [, r, g, b] = rgbMatch;
        const toHex = (n: string) => Math.min(255, parseInt(n, 10)).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Return as-is for named colors (let browser handle)
    return trimmed;
}

/**
 * Normalizes font size to a consistent format
 */
function normalizeFontSize(size: string | null | undefined): string | null {
    if (!size) return null;

    const trimmed = size.trim().toLowerCase();
    if (!trimmed || trimmed === 'inherit' || trimmed === 'initial') return null;

    // Already has valid unit
    if (/^[\d.]+\s*(pt|px|em|rem|%)$/i.test(trimmed)) {
        return trimmed.replace(/\s+/g, '');
    }

    // Handle Word's numeric sizes (like "12.0")
    const numMatch = trimmed.match(/^([\d.]+)$/);
    if (numMatch) {
        return `${numMatch[1]}pt`;
    }

    return trimmed;
}

/**
 * Normalizes font-family value
 */
function normalizeFontFamily(fontFamily: string | null | undefined): string | null {
    if (!fontFamily) return null;

    const trimmed = fontFamily.trim();
    if (!trimmed || trimmed === 'inherit' || trimmed === 'initial') return null;

    // Clean up quotes and normalize
    return trimmed
        .replace(/["']/g, '')
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0)
        .join(', ');
}



/**
 * Parses inline style string into an object
 */
function parseStyleString(styleStr: string): Record<string, string> {
    const styles: Record<string, string> = {};
    if (!styleStr) return styles;

    // Split by semicolon, but handle quotes
    const parts = styleStr.split(/;(?=(?:[^"']*["'][^"']*["'])*[^"']*$)/);

    for (const part of parts) {
        const colonIndex = part.indexOf(':');
        if (colonIndex > 0) {
            const prop = part.substring(0, colonIndex).trim().toLowerCase();
            const value = part.substring(colonIndex + 1).trim();
            if (prop && value) {
                styles[prop] = value;
            }
        }
    }

    return styles;
}

/**
 * Builds a clean style string from style properties
 */
function buildStyleString(styles: Record<string, string | null>): string {
    const parts: string[] = [];

    // Font family
    const fontFamily = normalizeFontFamily(styles['font-family']);
    if (fontFamily) {
        parts.push(`font-family: ${fontFamily}`);
    }

    // Font size
    const fontSize = normalizeFontSize(styles['font-size']);
    if (fontSize) {
        parts.push(`font-size: ${fontSize}`);
    }

    // Text color
    const color = normalizeColor(styles['color']);
    if (color && color !== '#000000') {
        parts.push(`color: ${color}`);
    }

    // Background color
    const bgColor = normalizeColor(styles['background-color'] || styles['background']);
    if (bgColor && bgColor !== '#ffffff' && bgColor !== 'transparent') {
        parts.push(`background-color: ${bgColor}`);
    }

    // Text alignment
    const textAlign = styles['text-align'];
    if (textAlign && textAlign !== 'left' && textAlign !== 'start') {
        parts.push(`text-align: ${textAlign}`);
    }

    // Line height
    const lineHeight = styles['line-height'];
    if (lineHeight && lineHeight !== 'normal') {
        parts.push(`line-height: ${lineHeight}`);
    }

    // Vertical align for sup/sub
    const verticalAlign = styles['vertical-align'];
    if (verticalAlign === 'super' || verticalAlign === 'sub') {
        parts.push(`vertical-align: ${verticalAlign}`);
    }

    // Border support (for Word bordered boxes)
    const border = styles['border'];
    if (border && border !== 'none' && border !== '0' && border !== '0px') {
        parts.push(`border: ${border}`);
    } else {
        // Check individual border properties
        const borderWidth = styles['border-width'] || styles['mso-border-alt'];
        const borderStyle = styles['border-style'];
        const borderColor = normalizeColor(styles['border-color']);

        if (borderWidth || borderStyle || borderColor) {
            const bw = borderWidth || '1px';
            const bs = borderStyle || 'solid';
            const bc = borderColor || '#000000';
            parts.push(`border: ${bw} ${bs} ${bc}`);
        }
    }

    // Padding
    const padding = styles['padding'];
    if (padding && padding !== '0' && padding !== '0px') {
        parts.push(`padding: ${padding}`);
    }

    // Margin - check individual margins as well (important for Word spacing)
    const margin = styles['margin'];
    const marginTop = styles['margin-top'];
    const marginBottom = styles['margin-bottom'];

    if (margin && margin !== '0' && margin !== '0px' && margin !== 'auto') {
        parts.push(`margin: ${margin}`);
    } else {
        // Check individual margins
        if (marginTop && marginTop !== '0' && marginTop !== '0px') {
            parts.push(`margin-top: ${marginTop}`);
        }
        if (marginBottom && marginBottom !== '0' && marginBottom !== '0px') {
            parts.push(`margin-bottom: ${marginBottom}`);
        }
    }

    // Word often uses mso-margin-* properties
    const msoMarginTop = styles['mso-margin-top-alt'];
    const msoMarginBottom = styles['mso-margin-bottom-alt'];
    if (msoMarginTop && !marginTop) {
        parts.push(`margin-top: ${msoMarginTop}`);
    }
    if (msoMarginBottom && !marginBottom) {
        parts.push(`margin-bottom: ${msoMarginBottom}`);
    }

    // Width (for tables and cells)
    const width = styles['width'];
    if (width && width !== 'auto') {
        parts.push(`width: ${width}`);
    }

    // Border spacing (for tables)
    const borderSpacing = styles['border-spacing'];
    if (borderSpacing) {
        parts.push(`border-spacing: ${borderSpacing}`);
    }

    // Border collapse (for tables)
    const borderCollapse = styles['border-collapse'];
    if (borderCollapse) {
        parts.push(`border-collapse: ${borderCollapse}`);
    }

    return parts.join('; ');
}

// ============================================================================
// PRE-PROCESSING STAGE
// ============================================================================

/**
 * Removes Word namespace declarations and comments
 */
function removeCommentsAndNamespaces(html: string): string {
    // Remove conditional comments
    html = html.replace(/<!--\[if[\s\S]*?endif\]-->/gi, '');

    // Remove regular comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // Remove XML declarations
    html = html.replace(/<\?xml[\s\S]*?\?>/gi, '');

    // Remove DOCTYPE
    html = html.replace(/<!DOCTYPE[\s\S]*?>/gi, '');

    // Remove namespace declarations from root element
    html = html.replace(/xmlns(:\w+)?="[^"]*"/gi, '');

    // Remove Word-specific namespace prefixes in tag names (but keep content)
    // e.g., <o:p> -> content

    return html;
}

/**
 * Removes style tags and their content
 */
function removeStyleTags(html: string): string {
    return html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}

// ============================================================================
// STRUCTURAL CLEANING STAGE
// ============================================================================

/**
 * Determines if we should remove a tag entirely
 */
function shouldRemoveTag(tagName: string): boolean {
    return REMOVE_TAGS.has(tagName.toLowerCase());
}

/**
 * Determines if we should unwrap a tag (keep content)
 */
function shouldUnwrapTag(tagName: string): boolean {
    const lower = tagName.toLowerCase();
    return UNWRAP_TAGS.has(lower) || lower.startsWith('o:') || lower.startsWith('w:') ||
        lower.startsWith('v:') || lower.startsWith('st1:') || lower.startsWith('st2:');
}

/**
 * Determines semantic tag based on styles
 */
function getSemanticTag(_element: Element, styles: Record<string, string>): string {
    const fontWeight = styles['font-weight'];
    const fontStyle = styles['font-style'];
    const textDecoration = styles['text-decoration'] || styles['text-decoration-line'] || '';
    const verticalAlign = styles['vertical-align'];

    // Check for bold
    if (fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900') {
        return 'strong';
    }

    // Check for italic
    if (fontStyle === 'italic' || fontStyle === 'oblique') {
        return 'em';
    }

    // Check for underline
    if (textDecoration.includes('underline')) {
        return 'u';
    }

    // Check for strikethrough
    if (textDecoration.includes('line-through')) {
        return 's';
    }

    // Check for superscript/subscript
    if (verticalAlign === 'super') {
        return 'sup';
    }
    if (verticalAlign === 'sub') {
        return 'sub';
    }

    return 'span';
}

/**
 * Creates a cleaned version of an element
 */
function cleanElement(element: Element, doc: Document): Element | DocumentFragment | null {
    const tagName = element.tagName.toLowerCase();

    // Remove tags we don't want
    if (shouldRemoveTag(tagName)) {
        return null;
    }

    // Unwrap tags - return content only
    if (shouldUnwrapTag(tagName)) {
        const fragment = doc.createDocumentFragment();
        for (const child of Array.from(element.childNodes)) {
            const cleaned = cleanNode(child, doc);
            if (cleaned) {
                if (cleaned instanceof DocumentFragment) {
                    fragment.appendChild(cleaned);
                } else {
                    fragment.appendChild(cleaned);
                }
            }
        }
        // If fragment has content, return it
        if (fragment.childNodes.length > 0) {
            return fragment;
        }
        // Return null if no content (text nodes handled as part of fragment)
        return null;
    }

    const htmlElement = element as HTMLElement;
    const styleStr = htmlElement.getAttribute('style') || '';
    const styles = parseStyleString(styleStr);

    // Determine the output tag
    let newTagName: string;

    switch (tagName) {
        case 'b':
        case 'strong':
            newTagName = 'strong';
            break;
        case 'i':
        case 'em':
            newTagName = 'em';
            break;
        case 'u':
            newTagName = 'u';
            break;
        case 's':
        case 'strike':
        case 'del':
            newTagName = 's';
            break;
        case 'sup':
            newTagName = 'sup';
            break;
        case 'sub':
            newTagName = 'sub';
            break;
        case 'span':
            newTagName = getSemanticTag(element, styles);
            break;
        case 'p':
        case 'div':
            // Check if this has a border - if so, keep as div
            const hasBorder = styles['border'] || styles['border-width'] ||
                styles['border-style'] || styles['border-top'] ||
                styles['border-bottom'] || styles['border-left'] ||
                styles['border-right'] || styles['mso-border-alt'];
            if (hasBorder) {
                newTagName = 'div';
            } else {
                newTagName = 'p';
            }
            break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
            newTagName = tagName;
            break;
        case 'ul':
        case 'ol':
        case 'li':
            newTagName = tagName;
            break;
        case 'br':
            return doc.createElement('br');
        case 'hr':
            return doc.createElement('hr');
        case 'table':
        case 'thead':
        case 'tbody':
        case 'tfoot':
        case 'tr':
            newTagName = tagName;
            break;
        case 'td':
        case 'th':
            newTagName = tagName;
            break;
        case 'a':
            newTagName = 'a';
            break;
        case 'img':
            newTagName = 'img';
            break;
        case 'blockquote':
            newTagName = 'blockquote';
            break;
        case 'pre':
        case 'code':
            newTagName = tagName;
            break;
        default:
            // Convert block-level unknown elements to p, inline to span
            const display = styles['display'];
            if (display === 'block' || display === 'list-item') {
                newTagName = 'p';
            } else {
                newTagName = 'span';
            }
    }

    // Create new element
    const newElement = doc.createElement(newTagName);

    // Copy specific attributes
    if (newTagName === 'a') {
        const href = htmlElement.getAttribute('href');
        if (href && !href.startsWith('javascript:')) {
            newElement.setAttribute('href', href);
        }
        const target = htmlElement.getAttribute('target');
        if (target) {
            newElement.setAttribute('target', target);
        }
    }

    if (newTagName === 'img') {
        const src = htmlElement.getAttribute('src');
        const alt = htmlElement.getAttribute('alt');
        if (src) newElement.setAttribute('src', src);
        if (alt) newElement.setAttribute('alt', alt);
        return newElement;
    }

    if (newTagName === 'td' || newTagName === 'th') {
        const colspan = htmlElement.getAttribute('colspan');
        const rowspan = htmlElement.getAttribute('rowspan');
        if (colspan && colspan !== '1') newElement.setAttribute('colspan', colspan);
        if (rowspan && rowspan !== '1') newElement.setAttribute('rowspan', rowspan);

        // Preserve cell borders
        const cellBorder = styles['border'] || styles['border-width'];
        const cellBorderColor = styles['border-color'];
        if (cellBorder || cellBorderColor) {
            const borderValue = cellBorder || '1px solid';
            const colorValue = cellBorderColor ? normalizeColor(cellBorderColor) || '#000' : '#000';
            styles['border'] = `${borderValue} ${colorValue}`.replace(/\s+/g, ' ').trim();
        }
    }

    if (newTagName === 'table') {
        // Preserve table border attribute
        const tableBorder = htmlElement.getAttribute('border');
        const tableStyle = htmlElement.style;

        if (tableBorder && tableBorder !== '0') {
            const borderColor = tableStyle.borderColor ? normalizeColor(tableStyle.borderColor) || '#000' : '#000';
            styles['border'] = `${tableBorder}px solid ${borderColor}`;
        }

        // Preserve table width
        const tableWidth = htmlElement.getAttribute('width') || tableStyle.width;
        if (tableWidth) {
            styles['width'] = tableWidth.includes('%') ? tableWidth : `${tableWidth}px`;
        }

        // Preserve cellpadding/cellspacing
        const cellpadding = htmlElement.getAttribute('cellpadding');
        const cellspacing = htmlElement.getAttribute('cellspacing');
        if (cellpadding) {
            styles['border-spacing'] = `${cellspacing || '0'}px`;
        }
    }

    if (newTagName === 'ol') {
        const start = htmlElement.getAttribute('start');
        if (start && start !== '1') newElement.setAttribute('start', start);
    }

    // Build and apply cleaned styles
    const cleanedStyle = buildStyleString(styles);
    if (cleanedStyle) {
        newElement.setAttribute('style', cleanedStyle);
    }

    // Process children
    for (const child of Array.from(element.childNodes)) {
        const cleaned = cleanNode(child, doc);
        if (cleaned) {
            if (cleaned instanceof DocumentFragment) {
                newElement.appendChild(cleaned);
            } else {
                newElement.appendChild(cleaned);
            }
        }
    }

    // Don't return empty block elements
    const isBlock = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote'].includes(newTagName);
    if (isBlock && !newElement.hasChildNodes()) {
        return null;
    }

    // Don't return empty inline elements with no meaningful content
    const isInline = ['span', 'strong', 'em', 'u', 's', 'sup', 'sub'].includes(newTagName);
    if (isInline && !newElement.textContent?.trim() && !newElement.hasChildNodes()) {
        return null;
    }

    return newElement;
}

/**
 * Cleans a node (element or text)
 */
function cleanNode(node: Node, doc: Document): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        // Preserve non-breaking spaces
        if (text.includes('\u00A0') || text.trim()) {
            return doc.createTextNode(text);
        }
        // Keep single spaces between elements
        if (text === ' ') {
            return doc.createTextNode(' ');
        }
        return null;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        return cleanElement(node as Element, doc);
    }

    return null;
}

// ============================================================================
// LIST CONVERSION STAGE
// ============================================================================

/**
 * Detects Word list type from element
 */
interface ListInfo {
    isOrdered: boolean;
    level: number;
}

function detectListInfo(element: HTMLElement): ListInfo | null {
    const style = element.getAttribute('style') || '';
    const className = element.getAttribute('class') || '';

    // Check for Word list classes
    if (!className.includes('Mso') && !style.includes('mso-list') &&
        !style.includes('margin-left') && !style.includes('text-indent')) {
        return null;
    }

    // Get level from style
    let level = 1;
    const levelMatch = style.match(/mso-list:.*?level(\d+)/i);
    if (levelMatch) {
        level = parseInt(levelMatch[1], 10);
    } else {
        // Estimate level from margin
        const marginMatch = style.match(/margin-left:\s*([\d.]+)/i);
        if (marginMatch) {
            const marginPx = parseFloat(marginMatch[1]);
            level = Math.max(1, Math.round(marginPx / 36)); // ~36px per indent level
        }
    }

    // Determine if ordered
    let isOrdered = false;

    // Check for decimal/letter indicators
    if (style.includes('decimal') || style.includes('lower-roman') ||
        style.includes('upper-roman') || style.includes('lower-alpha') ||
        style.includes('upper-alpha') || style.includes('lower-latin') ||
        style.includes('upper-latin')) {
        isOrdered = true;
    } else {
        // Look for list marker span
        const markerSpan = element.querySelector('span[style*="mso-list"]');
        if (markerSpan) {
            const markerText = markerSpan.textContent?.trim() || '';
            // Check for numeric markers (1., 2., a., b., i., ii., etc)
            if (/^[0-9]+[.\)]?\s*$/.test(markerText) ||
                /^[a-zA-Z][.\)]?\s*$/.test(markerText) ||
                /^[ivxlcdm]+[.\)]?\s*$/i.test(markerText)) {
                isOrdered = true;
            }
        }
    }

    return { isOrdered, level };
}

/**
 * Removes list marker content from element
 */
function removeListMarker(element: HTMLElement): void {
    // Remove mso-list spans
    const markerSpans = element.querySelectorAll('span[style*="mso-list"]');
    markerSpans.forEach(span => {
        const text = span.textContent?.trim() || '';
        // Only remove if it looks like a marker
        if (text.length <= 4 || /^[\d•\-○●■□◦▪a-zA-Z]+[.\):]?\s*$/.test(text)) {
            span.remove();
        }
    });

    // Remove ignore spans (Word's list marker containers)
    const ignoreSpans = element.querySelectorAll('span[style*="mso-list:Ignore"]');
    ignoreSpans.forEach(span => span.remove());

    // Clean up leading marker from text
    const firstChild = element.firstChild;
    if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
        let text = firstChild.textContent || '';
        // Remove leading bullets or numbers
        text = text.replace(/^\s*[\d•\-○●■□◦▪a-zA-Z]+[.\):]?\s*/, '');
        firstChild.textContent = text;
    }
}

/**
 * Converts Word-style list paragraphs to proper HTML lists
 */
function convertWordLists(container: HTMLElement, doc: Document): void {
    // Find all potential list items
    const listCandidates = container.querySelectorAll(
        'p[class*="MsoList"], p[style*="mso-list"], ' +
        'p.MsoListParagraph, p.MsoListParagraphCxSpFirst, ' +
        'p.MsoListParagraphCxSpMiddle, p.MsoListParagraphCxSpLast'
    );

    if (listCandidates.length === 0) return;

    // Group consecutive list items
    const groups: Array<{
        elements: HTMLElement[];
        isOrdered: boolean;
    }> = [];

    let currentGroup: { elements: HTMLElement[]; isOrdered: boolean } | null = null;

    listCandidates.forEach((element) => {
        const p = element as HTMLElement;
        const listInfo = detectListInfo(p);

        if (!listInfo) return;

        // Check if we need a new group
        const prev = p.previousElementSibling as HTMLElement | null;
        const isConsecutive = prev &&
            (prev.classList.contains('MsoListParagraph') ||
                prev.classList.contains('MsoListParagraphCxSpMiddle') ||
                prev.getAttribute('style')?.includes('mso-list'));

        if (!currentGroup || !isConsecutive || currentGroup.isOrdered !== listInfo.isOrdered) {
            currentGroup = { elements: [], isOrdered: listInfo.isOrdered };
            groups.push(currentGroup);
        }

        currentGroup.elements.push(p);
    });

    // Convert groups to lists
    for (const group of groups) {
        if (group.elements.length === 0) continue;

        const list = doc.createElement(group.isOrdered ? 'ol' : 'ul');
        const firstElement = group.elements[0];
        const parent = firstElement.parentElement;

        if (parent) {
            parent.insertBefore(list, firstElement);
        }

        for (const p of group.elements) {
            removeListMarker(p);

            const li = doc.createElement('li');

            // Move content to li
            while (p.firstChild) {
                li.appendChild(p.firstChild);
            }

            // Skip empty items
            if (li.textContent?.trim() || li.querySelector('img, table')) {
                list.appendChild(li);
            }

            // Remove original paragraph
            p.remove();
        }

        // Remove empty list
        if (!list.hasChildNodes()) {
            list.remove();
        }
    }
}

// ============================================================================
// TABLE CLEANING STAGE
// ============================================================================

/**
 * Cleans Word tables
 */
function cleanTables(container: HTMLElement): void {
    const tables = container.querySelectorAll('table');

    tables.forEach(table => {
        // Remove Word-specific attributes
        table.removeAttribute('border');
        table.removeAttribute('cellpadding');
        table.removeAttribute('cellspacing');
        table.removeAttribute('width');

        // Clean up classes
        const currentClass = table.getAttribute('class') || '';
        const cleanedClass = currentClass.split(/\s+/)
            .filter(cls => !WORD_CLASS_PATTERNS.some(p => p.test(cls)))
            .join(' ')
            .trim();
        if (cleanedClass) {
            table.setAttribute('class', cleanedClass);
        } else {
            table.removeAttribute('class');
        }

        // Clean cells
        const cells = table.querySelectorAll('td, th');
        cells.forEach(cell => {
            cell.removeAttribute('width');
            cell.removeAttribute('height');
            cell.removeAttribute('valign');

            // Clean class
            const cellClass = cell.getAttribute('class') || '';
            const cleanedCellClass = cellClass.split(/\s+/)
                .filter(cls => !WORD_CLASS_PATTERNS.some(p => p.test(cls)))
                .join(' ')
                .trim();
            if (cleanedCellClass) {
                cell.setAttribute('class', cleanedCellClass);
            } else {
                cell.removeAttribute('class');
            }
        });
    });
}

// ============================================================================
// FINAL CLEANUP
// ============================================================================

/**
 * Removes empty elements recursively
 */
function removeEmptyElements(container: HTMLElement): void {
    const emptyTags = ['span', 'strong', 'em', 'u', 's', 'b', 'i', 'font'];

    let changed = true;
    while (changed) {
        changed = false;

        for (const tag of emptyTags) {
            const elements = container.querySelectorAll(tag);
            elements.forEach(el => {
                if (!el.textContent?.trim() && !el.querySelector('img, br, hr, table')) {
                    // Move children to parent if any
                    const parent = el.parentNode;
                    if (parent) {
                        while (el.firstChild) {
                            parent.insertBefore(el.firstChild, el);
                        }
                        parent.removeChild(el);
                        changed = true;
                    }
                }
            });
        }
    }
}

/**
 * Normalizes whitespace in text nodes
 */
function normalizeWhitespace(container: HTMLElement): void {
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
    );

    const textNodes: Text[] = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach(node => {
        let text = node.textContent || '';

        // Replace multiple spaces with single space (but preserve non-breaking spaces)
        text = text.replace(/[ \t]+/g, ' ');

        // Remove leading/trailing whitespace from block-level element text
        const parent = node.parentElement;
        if (parent) {
            const display = window.getComputedStyle(parent).display;
            if (display === 'block' || display === 'list-item') {
                if (node === parent.firstChild) {
                    text = text.replace(/^\s+/, '');
                }
                if (node === parent.lastChild) {
                    text = text.replace(/\s+$/, '');
                }
            }
        }

        node.textContent = text;
    });
}

// ============================================================================
// MAIN TRANSFORM FUNCTION
// ============================================================================

/**
 * Main function to transform pasted HTML from Word/RTF
 */
export function transformWordHTML(html: string): string {
    // Stage 1: Pre-processing
    html = removeCommentsAndNamespaces(html);
    html = removeStyleTags(html);

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Stage 2: Convert Word lists before general cleaning
    convertWordLists(doc.body, doc);

    // Stage 3: Clean tables
    cleanTables(doc.body);

    // Create clean output container
    const outputDoc = document.implementation.createHTMLDocument('');
    const output = outputDoc.createElement('div');

    // Stage 4: Structural cleaning - process all body children
    for (const child of Array.from(doc.body.childNodes)) {
        const cleaned = cleanNode(child, outputDoc);
        if (cleaned) {
            if (cleaned instanceof DocumentFragment) {
                output.appendChild(cleaned);
            } else {
                output.appendChild(cleaned);
            }
        }
    }

    // Stage 5: Final cleanup
    removeEmptyElements(output);
    normalizeWhitespace(output);

    return output.innerHTML;
}

/**
 * Detects if the pasted HTML is from Microsoft Word or similar RTF source
 */
function isWordHTML(html: string): boolean {
    const wordPatterns = [
        /xmlns:w=/i,
        /xmlns:o=/i,
        /xmlns:m=/i,
        /xmlns:v=/i,
        /mso-/i,
        /class=["']?Mso/i,
        /<o:p>/i,
        /<!--\[if/i,
        /urn:schemas-microsoft-com/i,
        /<w:/i,
        /<v:/i,
        /style=["'][^"']*mso-/i,
        /MsoNormal/i,
        /MsoListParagraph/i,
    ];

    return wordPatterns.some(pattern => pattern.test(html));
}

/**
 * Detects if content is from Google Docs
 */
function isGoogleDocsHTML(html: string): boolean {
    return html.includes('docs-internal-guid') ||
        html.includes('id="docs-internal-guid');
}

/**
 * Cleans Google Docs HTML
 */
function transformGoogleDocsHTML(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Google Docs uses lots of wrapper spans
    const outputDoc = document.implementation.createHTMLDocument('');
    const output = outputDoc.createElement('div');

    for (const child of Array.from(doc.body.childNodes)) {
        const cleaned = cleanNode(child, outputDoc);
        if (cleaned) {
            if (cleaned instanceof DocumentFragment) {
                output.appendChild(cleaned);
            } else {
                output.appendChild(cleaned);
            }
        }
    }

    removeEmptyElements(output);

    return output.innerHTML;
}

// ============================================================================
// PLUGIN CREATION
// ============================================================================

/**
 * Creates the clipboard paste plugin
 */
export function createClipboardPastePlugin(): Plugin {
    return new Plugin({
        key: clipboardPastePluginKey,
        props: {
            /**
             * Transform pasted HTML to clean up Word/RTF-specific markup
             */
            transformPastedHTML(html: string): string {
                // Detect and clean Word content
                if (isWordHTML(html)) {
                    console.log('[ClipboardPaste] Detected Word/Office content, cleaning...');
                    return transformWordHTML(html);
                }

                // Detect and clean Google Docs content
                if (isGoogleDocsHTML(html)) {
                    console.log('[ClipboardPaste] Detected Google Docs content, cleaning...');
                    return transformGoogleDocsHTML(html);
                }

                // For other content, do a basic cleanup
                // Remove style tags
                html = removeStyleTags(html);

                return html;
            },

            /**
             * Handle paste events for special processing
             */
            handlePaste(_view: EditorView, event: ClipboardEvent, _slice: Slice): boolean {
                const clipboardData = event.clipboardData;
                if (!clipboardData) return false;

                // Get available formats for debugging
                const types = Array.from(clipboardData.types);
                const html = clipboardData.getData('text/html');

                if (html) {
                    console.log('[ClipboardPaste] Paste detected, formats:', types.join(', '));
                    console.log('[ClipboardPaste] HTML length:', html.length);

                    // Check if it's Word content
                    if (isWordHTML(html)) {
                        console.log('[ClipboardPaste] Word content detected');
                    }
                }

                // Let ProseMirror handle the paste with our transformed HTML
                return false;
            },

            /**
             * Transform pasted text (plain text fallback)
             */
            transformPastedText(text: string, _plain: boolean): string {
                return text;
            },
        },
    });
}

export default createClipboardPastePlugin;
