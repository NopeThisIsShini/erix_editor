/**
 * @fileoverview Type definitions for the ErixEditor component
 */

export interface ErixEditorProps {
  /**
   * The editor theme - 'light' or 'dark'
   */
  theme?: 'light' | 'dark' | string;
  
  /**
   * Placeholder text when editor is empty
   */
  placeholder?: string;
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
