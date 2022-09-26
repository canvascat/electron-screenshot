export type Point = [number, number];

export type Path = Point[];

export interface CaptureLayer {
  x: number;
  y: number;
  w: number;
  h: number;
}

// /** 用于创建字符串列表映射至 `K: V` 的函数 */
// const createStrEnum = <T extends string>(a: Array<T>): { [K in T]: K } => a.reduce((o, key) => (o[key] = key, o), Object.create(null));

export type CaptureActionType = 'CREATE' | 'MOVE' | 'RESIZE';
export type ToolActionType =
  | 'TEXT'
  | 'RECT'
  | 'ELLIPSE'
  | 'LINE'
  | 'ARROW'
  | 'BRUSH'
  | 'MOSAIC';
export type CmdActionType =
  | 'RETURN'
  | 'SAVE'
  | 'CANCEL'
  | 'CONFIRM'
  | 'USE_UPLOAD_FILE'
  | 'USE_SCREEN_CAPTURE';
export type ActionType = CaptureActionType | ToolActionType | CmdActionType;

export type ResizePointPosition = 'top' | 'right' | 'bottom' | 'left';
export interface ResizePoint {
  position: ResizePointPosition[];
  cursor: 'ew-resize' | 'ns-resize' | 'nesw-resize' | 'nwse-resize';
}

export interface BoundItem {
  min: number;
  max: number;
}
export interface Bound {
  x: BoundItem;
  y: BoundItem;
}

export interface Action {
  id: ActionType;
  icon: string;
  label: string;
}

export interface ToolAction extends Action {
  id: ToolActionType;
  cursor?: string;
  attr?: ToolAttr;
}

export interface CmdAction extends Action {
  id: CmdActionType;
}

export interface CaptureAction extends Action {
  id: CaptureActionType;
}

export interface ActionHistoryItem {
  id: ToolActionType;
  path?: Point[];
  snapshot?: string;
  attr?: ToolAttr;
}

export interface ToolAttr {
  color?: string;
  width?: number;
}
