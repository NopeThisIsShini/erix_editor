/**
 * Erix Editor Core
 * Main entry point for the editor core module.
 * Exports schema, plugins, and commands.
 */

// Schema
export { editorSchema, type TextAlignment } from './schema/index';

// Plugins
export { editorPlugins, createEditorPlugins } from './plugins/index';

// Commands - Text Format
export {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleSuperscript,
  toggleSubscript,
  isBoldActive,
  isItalicActive,
  isUnderlineActive,
  isStrikethroughActive,
  isSuperscriptActive,
  isSubscriptActive,
  isMarkActive,
  setTextCase,
} from './commands/index';

// Commands - List
export {
  toggleBulletList,
  toggleOrderedList,
  isInBulletList,
  isInOrderedList,
  increaseIndent,
  decreaseIndent,
} from './commands/index';

// Commands - Heading
export {
  setHeading,
  setParagraph,
  getCurrentHeadingLevel,
} from './commands/index';

// Commands - Font
export {
  setFontFamily,
  setFontSize,
  getActiveFontFamily,
  getActiveFontSize,
} from './commands/index';

// Commands - Alignment
export {
  setTextAlignment,
  getActiveAlignment,
  setTextLineSpacing,
  getActiveLineSpacing,
} from './commands/index';

// Commands - Blockquote
export {
  toggleBlockquote,
  isBlockquoteActive,
} from './commands/index';

// Commands - Document
export {
  printDocument,
  insertPageBreak,
} from './commands/index';

// Commands - History
export { undo, redo } from './commands/index';

// Table Commands
export * from './commands/table';
