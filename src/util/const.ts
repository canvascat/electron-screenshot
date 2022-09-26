export const CAPTURE_ACTION_IDS = Object.freeze(['CREATE', 'MOVE', 'RESIZE']);

export const TOOL_ACTION_IDS = Object.freeze([
  'TEXT',
  'RECT',
  'ELLIPSE',
  'LINE',
  'ARROW',
  'BRUSH',
  'MOSAIC',
]);

export const CMD_ACTION_IDS = Object.freeze([
  'RETURN',
  'SAVE',
  'CANCEL',
  'CONFIRM',
]);

/** KeyboardEvent code Map */
export const EVENT_CODE = {
  tab: 'Tab',
  enter: 'Enter',
  space: 'Space',
  left: 'ArrowLeft', // 37
  up: 'ArrowUp', // 38
  right: 'ArrowRight', // 39
  down: 'ArrowDown', // 40
  esc: 'Escape',
  delete: 'Delete',
  backspace: 'Backspace',
};

export const DEFAULT_COLOR = '#ff0000';
export const DEFAULT_WIDTH = 2;
