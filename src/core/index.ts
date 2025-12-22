/**
 * TypeForge Core - Entry Point
 * Exports all core editor functionality.
 */

// Schema
export { editorSchema, type TextAlignment } from './schema';

// Plugins
export { editorPlugins, createEditorPlugins } from './plugins';

// Commands
export {
  // Mark commands
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleSuperscript,
  toggleSubscript,

  // Mark state checks
  isBoldActive,
  isItalicActive,
  isUnderlineActive,
  isStrikethroughActive,
  isSuperscriptActive,
  isSubscriptActive,
  isMarkActive,

  // Text Case commands
  setTextCase,

  // List commands
  toggleBulletList,
  toggleOrderedList,
  isInBulletList,
  isInOrderedList,

  // Indent commands
  increaseIndent,
  decreaseIndent,

  // Heading commands
  setHeading,
  setParagraph,
  getCurrentHeadingLevel,

  // Font commands
  getActiveFontFamily,
  getActiveFontSize,
  setFontFamily,
  setFontSize,

  // Alignment and spacing commands
  setTextAlignment,
  getActiveAlignment,
  setTextLineSpacing,
  getActiveLineSpacing,

  // Document commands
  printDocument,
  insertPageBreak,

  // History
  undo,
  redo,
} from './commands';
