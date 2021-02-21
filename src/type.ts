export type Point = [number, number]

export type Path = Array<Point>

export type CaptureLayer = {
  x: number
  y: number
  w: number
  h: number
}

// /** 用于创建字符串列表映射至 `K: V` 的函数 */
// const createStrEnum = <T extends string>(a: Array<T>): { [K in T]: K } => a.reduce((o, key) => (o[key] = key, o), Object.create(null));

export type CaptureActionType = 'CREATE' | 'MOVE' | 'RESIZE'
export type ToolActionType = 'TEXT' | 'RECT' | 'ELLIPSE' | 'LINE' | 'ARROW' | 'BRUSH' | 'MOSAIC'
export type CmdActionType = 'RETURN' | 'SAVE' | 'CANCEL' | 'CONFIRM' | 'USE_UPLOAD_FILE' | 'USE_SCREEN_CAPTURE'
export type ActionType = CaptureActionType | ToolActionType | CmdActionType

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
  id: ActionType
  icon?: string
  label?: string
}

export type ToolAction = {
  id: ToolActionType
  // TODO
  cursor?: string
} & Action

export type CmdAction = {
  id: CmdActionType
} & Action

export type CaptureAction = {
  id: CaptureActionType
} & Action

export type ActionHistoryItem = {
  id: ToolActionType
  path?: Array<Point>
  snapshoot?: string
  // TODO
  attr?: {
    color: string
    width: number
  }
}
