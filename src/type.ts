export type Point = [number, number]

export type CaptureLayer = {
  x: number
  y: number
  w: number
  h: number
}

export type CaptureActionType = 'CREATE' | 'MOVE' | 'RESIZE'

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
