/**
 * Word Document Importer
 * Converts .docx files to HTML for the editor.
 * 
 * @example
 * ```typescript
 * const html = await parseWordDocument(file);
 * editor.setContent(html, 'html');
 * ```
 */

import JSZip from 'jszip';
import { Schema, Node as ProseMirrorNode } from 'prosemirror-model';
import { parseFromHTML } from './html-serializer';

// =============================================================================
// TYPES
// =============================================================================

export interface WordImportOptions {
  preserveStyles?: boolean;
  preserveLists?: boolean;
}

export interface WordImportResult {
  html: string;
  text: string;
  metadata: WordDocumentMetadata;
  warnings: string[];
}

export interface WordDocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
}

// =============================================================================
// WORD DOCUMENT PARSING
// =============================================================================

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function parseXML(xmlString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

function getElementsNS(parent: Element | Document, localName: string): Element[] {
  return Array.from(parent.getElementsByTagNameNS(WORD_NS, localName));
}

function parseDocumentContent(documentXml: Document, options: WordImportOptions): string {
  const body = getElementsNS(documentXml, 'body')[0];
  if (!body) return '';
  
  const htmlParts: string[] = [];
  const paragraphs = getElementsNS(body, 'p');
  
  let isInList = false;
  let listType: 'ul' | 'ol' = 'ul';
  
  paragraphs.forEach((para) => {
    const content = parseParagraph(para, options);
    const listInfo = detectList(para);
    
    if (listInfo && options.preserveLists !== false) {
      if (!isInList) {
        listType = listInfo.type;
        htmlParts.push(`<${listType}>`);
        isInList = true;
      }
      htmlParts.push(`<li>${content}</li>`);
    } else {
      if (isInList) {
        htmlParts.push(`</${listType}>`);
        isInList = false;
      }
      
      if (content.trim()) {
        const tag = getHeadingTag(para) || 'p';
        const style = getAlignment(para);
        htmlParts.push(`<${tag}${style}>${content}</${tag}>`);
      }
    }
  });
  
  if (isInList) {
    htmlParts.push(`</${listType}>`);
  }
  
  return htmlParts.join('\n');
}

function detectList(para: Element): { type: 'ul' | 'ol' } | null {
  const pPr = getElementsNS(para, 'pPr')[0];
  if (!pPr) return null;
  
  const numPr = getElementsNS(pPr, 'numPr')[0];
  if (!numPr) return null;
  
  const numId = getElementsNS(numPr, 'numId')[0];
  if (!numId) return null;
  
  const val = numId.getAttributeNS(WORD_NS, 'val');
  return { type: val && parseInt(val, 10) % 2 === 0 ? 'ul' : 'ol' };
}

function getHeadingTag(para: Element): string | null {
  const pPr = getElementsNS(para, 'pPr')[0];
  if (!pPr) return null;
  
  const pStyle = getElementsNS(pPr, 'pStyle')[0];
  if (!pStyle) return null;
  
  const styleVal = pStyle.getAttributeNS(WORD_NS, 'val');
  if (!styleVal) return null;
  
  const match = styleVal.match(/Heading(\d)/i);
  if (match) {
    const level = parseInt(match[1], 10);
    if (level >= 1 && level <= 6) return `h${level}`;
  }
  
  return null;
}

function getAlignment(para: Element): string {
  const pPr = getElementsNS(para, 'pPr')[0];
  if (!pPr) return '';
  
  const jc = getElementsNS(pPr, 'jc')[0];
  if (!jc) return '';
  
  const val = jc.getAttributeNS(WORD_NS, 'val');
  const map: Record<string, string> = {
    left: 'left', center: 'center', right: 'right', 
    both: 'justify', distribute: 'justify'
  };
  
  return val && map[val] ? ` style="text-align: ${map[val]};"` : '';
}

function parseParagraph(para: Element, options: WordImportOptions): string {
  const runs = getElementsNS(para, 'r');
  return runs.map(run => parseRun(run, options)).join('');
}

function parseRun(run: Element, options: WordImportOptions): string {
  const textEls = getElementsNS(run, 't');
  let text = textEls.map(t => t.textContent || '').join('');
  
  // Handle line breaks
  const breaks = getElementsNS(run, 'br');
  breaks.forEach(() => { text += '<br>'; });
  
  if (!text) return '';
  
  if (options.preserveStyles !== false) {
    text = applyFormatting(run, text);
  }
  
  return text;
}

function applyFormatting(run: Element, text: string): string {
  const rPr = getElementsNS(run, 'rPr')[0];
  if (!rPr) return text;
  
  let result = text;
  
  if (getElementsNS(rPr, 'b').length > 0) result = `<strong>${result}</strong>`;
  if (getElementsNS(rPr, 'i').length > 0) result = `<em>${result}</em>`;
  if (getElementsNS(rPr, 'u').length > 0) result = `<u>${result}</u>`;
  if (getElementsNS(rPr, 'strike').length > 0) result = `<s>${result}</s>`;
  
  const vertAlign = getElementsNS(rPr, 'vertAlign')[0];
  if (vertAlign) {
    const val = vertAlign.getAttributeNS(WORD_NS, 'val');
    if (val === 'superscript') result = `<sup>${result}</sup>`;
    else if (val === 'subscript') result = `<sub>${result}</sub>`;
  }
  
  return result;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Parse a Word document (.docx) and extract HTML content.
 */
export async function parseWordDocument(
  file: File | Blob | ArrayBuffer,
  options: WordImportOptions = {}
): Promise<WordImportResult> {
  // Read file as ArrayBuffer
  let arrayBuffer: ArrayBuffer;
  if (file instanceof ArrayBuffer) {
    arrayBuffer = file;
  } else {
    arrayBuffer = await file.arrayBuffer();
  }
  
  // Open the ZIP (docx is a ZIP file)
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Read document.xml
  const docFile = zip.file('word/document.xml');
  if (!docFile) {
    throw new Error('Invalid Word document: Could not find document.xml');
  }
  
  const docXmlContent = await docFile.async('string');
  const documentXml = parseXML(docXmlContent);
  
  // Parse content
  const html = parseDocumentContent(documentXml, options);
  
  // Extract plain text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || '';
  
  // Extract metadata
  const metadata: WordDocumentMetadata = {};
  try {
    const coreFile = zip.file('docProps/core.xml');
    if (coreFile) {
      const coreXml = parseXML(await coreFile.async('string'));
      const title = coreXml.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'title')[0];
      const creator = coreXml.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'creator')[0];
      if (title) metadata.title = title.textContent || undefined;
      if (creator) metadata.author = creator.textContent || undefined;
    }
  } catch { /* ignore metadata errors */ }
  
  return { html, text, metadata, warnings: [] };
}

/**
 * Parse a Word document and return a ProseMirror Node.
 */
export async function parseWordToNode(
  file: File | Blob | ArrayBuffer,
  schema: Schema,
  options: WordImportOptions = {}
): Promise<ProseMirrorNode> {
  const result = await parseWordDocument(file, options);
  return parseFromHTML(result.html, schema);
}

/**
 * Validate if a file is a valid Word document.
 */
export function isValidWordDocument(file: File): boolean {
  return file.name.endsWith('.docx');
}

/**
 * Open a file picker and import a Word document.
 */
export function openWordFileDialog(
  options: WordImportOptions = {}
): Promise<WordImportResult | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx';
    input.style.display = 'none';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      
      if (!file) {
        resolve(null);
        return;
      }
      
      try {
        const result = await parseWordDocument(file, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(null);
    };
    
    document.body.appendChild(input);
    input.click();
  });
}
