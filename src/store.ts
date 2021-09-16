import { reactive, ref, shallowReactive, shallowRef } from 'vue'
import type { ActionHistoryItem, Bound, ActionType, CaptureLayer, Point, ToolAction } from './type'
import { DEFAULT_COLOR, DEFAULT_WIDTH } from './util/const'

export const imageSource = new Image()

export const inited = ref(false)

export const bound: Bound = reactive({
  x: { min: 0, max: 0 },
  y: { min: 0, max: 0 },
})

export const captureLayer: CaptureLayer = reactive({ x: -999, y: -999, h: 0, w: 0 })

export const action = ref<ActionType>()

export const canvasRef = ref<HTMLCanvasElement>()

export const actionHistory = shallowReactive(<Array<ActionHistoryItem>>[])

export const drawBound = ref<Bound>()

export function updateDrawBound (ah = actionHistory) {
  if (ah.length === 0) {
    drawBound.value = undefined
    return
  }
  drawBound.value ??= {
    x: { min: 0, max: 0 },
    y: { min: 0, max: 0 },
  }
  const path = ah.reduce((p, { path }) => (path && p.push(...path), p), <Array<Point>>[])
  const [xps, yps] = path.reduce((o, [x, y]) => (o[0].push(x), o[1].push(y), o), [<Array<number>>[], <Array<number>>[]])
  drawBound.value.x.min = Math.min(...xps)
  drawBound.value.x.max = Math.max(...xps)
  drawBound.value.y.min = Math.min(...yps)
  drawBound.value.y.max = Math.max(...yps)
}

/** 绘制马赛克的图片原始像素数据 */
export const mosaicOriginalPxData = shallowRef<Uint8ClampedArray>()

export const TOOL_ACTIONS: Array<ToolAction> = [
  { icon: 'A', label: '添加文字(TODO)', id: 'TEXT', cursor: 'text' },
  { icon: '⬜', label: '矩形工具', id: 'RECT', attr: reactive({ color: DEFAULT_COLOR, width: DEFAULT_WIDTH }) },
  { icon: '⚪', label: '椭圆工具', id: 'ELLIPSE', attr: reactive({ color: DEFAULT_COLOR, width: DEFAULT_WIDTH }) },
  { icon: '╱', label: '直线工具', id: 'LINE', attr: reactive({ color: DEFAULT_COLOR, width: DEFAULT_WIDTH }) },
  { icon: '↗', label: '箭头工具', id: 'ARROW', attr: reactive({ color: DEFAULT_COLOR, width: DEFAULT_WIDTH }) },
  { icon: '🖊', label: '笔刷工具', id: 'BRUSH', attr: reactive({ color: DEFAULT_COLOR, width: DEFAULT_WIDTH }) },
  { icon: '🐴', label: '马赛克工具', id: 'MOSAIC' }, // 🐎🐴
]

export const getToolById = (id: string) => TOOL_ACTIONS.find(t => t.id === id)
