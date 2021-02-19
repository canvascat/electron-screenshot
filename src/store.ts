import { reactive, ref } from 'vue'
import type { ActionHistoryItem, Bound, CaptureActionType, CaptureLayer } from './type'

export const imageSource = new Image()

export const inited = ref(false)

export const bound: Bound = reactive({
  x: { min: 0, max: 0 },
  y: { min: 0, max: 0 },
})

export const captureLayer: CaptureLayer = reactive({ x: 0, y: 0, h: 0, w: 0 })

export const action = ref(<Nullable<CaptureActionType>>null)

export const canvasRef = ref(null as Nullable<HTMLCanvasElement>)

export const actionHistory = <Array<ActionHistoryItem>>[]
