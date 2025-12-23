/**
 * Commands Module
 * Exports all editor commands organized by category.
 */

// Text Format Commands
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
} from './text-format';

// List Commands
export {
  toggleBulletList,
  toggleOrderedList,
  isInBulletList,
  isInOrderedList,
  increaseIndent,
  decreaseIndent,
} from './list';

// Heading Commands
export {
  setHeading,
  setParagraph,
  getCurrentHeadingLevel,
} from './heading';

// Font Commands
export {
  setFontFamily,
  setFontSize,
  getActiveFontFamily,
  getActiveFontSize,
} from './font';

// Alignment Commands
export {
  setTextAlignment,
  getActiveAlignment,
  setTextLineSpacing,
  getActiveLineSpacing,
} from './alignment';

// Document Commands
export {
  printDocument,
  insertPageBreak,
} from './document';

// History Commands
export { undo, redo } from './history';
