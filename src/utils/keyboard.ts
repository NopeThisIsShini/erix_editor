/**
 * Keyboard Utilities
 * A collection of keyboard event handling utilities.
 */

/**
 * Common keyboard key codes for reference.
 */
export const KeyCodes = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  SPACE: ' ',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Checks if a keyboard event matches a specific key.
 * @param event The keyboard event.
 * @param key The key to check for.
 * @returns True if the event matches the key.
 */
export function isKey(event: KeyboardEvent, key: string): boolean {
  return event.key === key;
}

/**
 * Checks if a keyboard event is using a modifier key.
 * @param event The keyboard event.
 * @returns True if Ctrl, Meta, Alt, or Shift is pressed.
 */
export function hasModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
}

/**
 * Checks if the Ctrl key (or Cmd on Mac) is pressed.
 * @param event The keyboard event.
 * @returns True if Ctrl/Cmd is pressed.
 */
export function isCtrlOrCmd(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

/**
 * Creates a keyboard shortcut string from an event.
 * @param event The keyboard event.
 * @returns A string representation of the shortcut (e.g., "Ctrl+S").
 */
export function getShortcutString(event: KeyboardEvent): string {
  const parts: string[] = [];
  
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.metaKey) parts.push('Cmd');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  
  if (event.key && !['Control', 'Meta', 'Alt', 'Shift'].includes(event.key)) {
    parts.push(event.key.toUpperCase());
  }
  
  return parts.join('+');
}
