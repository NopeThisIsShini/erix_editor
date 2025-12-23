/**
 * @fileoverview Type definitions for the ErixEditor component
 */

import type { ErixEditorAPI } from '@src/api';

export interface ErixEditorProps {
  /**
   * The editor theme - 'light' or 'dark'
   */
  theme?: 'light' | 'dark' | string;
  
  /**
   * Placeholder text when editor is empty
   */
  placeholder?: string;

  /**
   * Initial content (HTML string)
   */
  content?: string;

  /**
   * Whether the editor is read-only
   */
  readonly?: boolean;
}

export interface EditorContent {
  /**
   * The HTML content of the editor
   */
  html: string;
  
  /**
   * The plain text content of the editor
   */
  text: string;
  
  /**
   * The ProseMirror JSON document
   */
  json: object;
}

/**
 * Event detail for the erix-ready event
 */
export interface ErixReadyEventDetail {
  api: ErixEditorAPI;
}
