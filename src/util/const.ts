export const CAPTURE_ACTIONS = Object.freeze(['CREATE', 'MOVE', 'RESIZE'])

export const TOOL_ACTIONS = Object.freeze(['TEXT', 'RECT', 'ELLIPSE', 'LINE', 'ARROW', 'BRUSH', 'MOSAIC'])

export const CMD_ACTIONS = Object.freeze(['RETURN', 'SAVE', 'CANCEL', 'CONFIRM'])

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
}
