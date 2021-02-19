import { reactive, ref } from 'vue'
import type { ActionHistoryItem, Bound, CaptureActionType, CaptureLayer, Point } from './type'

export const imageSource = new Image()

export const inited = ref(false)

export const bound: Bound = reactive({
  x: { min: 0, max: 0 },
  y: { min: 0, max: 0 },
})

export const captureLayer: CaptureLayer = reactive({ x: 0, y: 0, h: 0, w: 0 })

export const action = ref(<Nullable<CaptureActionType>>null)

export const canvasRef = ref(null as Nullable<HTMLCanvasElement>)

export const actionHistory = reactive(<Array<ActionHistoryItem>>[])

export const drawBound = ref(<Nullable<Bound>>null)

export function updateDrawBound (ah = actionHistory) {
  if (ah.length === 0) {
    drawBound.value = null;
    return;
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
  console.log(drawBound.value)
}
