/**
 * Semantic Editor Icon Map
 * Icons represent editor-specific concepts rather than generic UI actions.
 */

export const ICONS = {
  commandPalette: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <path d="M9 3v18"></path>
      <path d="M15 3v18"></path>
      <path d="M3 9h18"></path>
      <path d="M3 15h18"></path>
    </svg>
  `,
  insertBlock: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  `,
  pageBreak: `
<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 2.5 12ZM6.5 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 6.5 12ZM10.5 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM14.5 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM18.5 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM4.75 2a.75.75 0 0 0-.75.75V7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2.75a.75.75 0 0 0-1.5 0V7a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V2.75A.75.75 0 0 0 4.75 2ZM19.25 22a.75.75 0 0 0 .75-.75V17a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4.25a.75.75 0 0 0 1.5 0V17a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 .5.5v4.25c0 .414.336.75.75.75Z" fill="#212121"/></svg>  `,
  formatBold: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
    </svg>
  `,
  formatHeading: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 12h12"></path>
      <path d="M6 20V4"></path>
      <path d="M18 20V4"></path>
    </svg>
  `,
  tableAddRow: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="12" y1="15" x2="12" y2="21"></line>
      <line x1="9" y1="18" x2="15" y2="18"></line>
    </svg>
  `,
  docOutline: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  `,
  commentThread: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `,
  cursorInsert: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="9" y1="5" x2="15" y2="5"></line>
      <line x1="9" y1="19" x2="15" y2="19"></line>
    </svg>
  `,
} as const;

export type IconName = keyof typeof ICONS;
