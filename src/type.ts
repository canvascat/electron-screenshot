export type Point = [number, number]

export type Path = Array<Point>

export type CaptureLayer = {
  x: number
  y: number
  w: number
  h: number
}

export type CaptureActionType = 'CREATE' | 'MOVE' | 'RESIZE' | 'TEXT' | 'RECT' | 'ELLIPSE' | 'LINE' | 'ARROW' | 'BRUSH'

export type ResizePointPosition = 'top' | 'right' | 'bottom' | 'left'
export type ResizePoint = {
  position: Array<ResizePointPosition>
  cursor: 'ew-resize' | 'ns-resize' | 'nesw-resize' | 'nwse-resize'
}

export type BoundItem = {
  min: number
  max: number
}
export type Bound = {
  x: BoundItem
  y: BoundItem
}

export type Action = {
  id: string,
  icon?: string,
  label?: string
}

export type ToolAction = {
  id: CaptureActionType
} & Action

export type ActionHistoryItem = {
  id: CaptureActionType,
  path?: Array<Point>,
  snapshoot?: string
}
