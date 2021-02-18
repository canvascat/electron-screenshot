<template>
  <div class="wrapper" ref="wrapRef">
    <canvas ref="canvasRef" :width="bound.x.max" :height="bound.y.max"></canvas>
    <div class="capture-layer" :style="captureLayerStyle" @mousedown="startMove">
      <i
        v-for="p in RESIZE_POINTS"
        @mousedown.prevent="startResize($event, p)"
        :key="p.position.join()"
        :style="
          p.position.reduce((o, p) => Object.assign(o, { [p]: '-3px' }), {
            cursor: p.cursor,
          })
        "
        class="resize-point"
      />
    </div>
    <InfoBox :mousePoint="mousePoint" :canvas="canvasRef" v-if="infoBoxVisible">
      <p>{{ captureLayer.w }} x {{ captureLayer.h }}</p>
      <p>RGB({{ RGB }})</p>
    </InfoBox>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { bound } from 'src/store'
import InfoBox from './components/info-box.vue'
import {
  CaptureActionType,
  CaptureLayer,
  Point,
  ResizePoint,
  ResizePointPosition,
} from 'src/type'
import {
  addResizeListener,
  createCSSRule,
  createStyleSheet,
  once,
  removeResizeListener,
} from 'src/util/dom'
import { rafThrottle } from 'src/util/util'
import { cloneDeep } from 'lodash'

const RESIZE_POINTS: Array<ResizePoint> = [
  { position: ['top'], cursor: 'ns-resize' },
  { position: ['bottom'], cursor: 'ns-resize' },
  { position: ['left'], cursor: 'ew-resize' },
  { position: ['right'], cursor: 'ew-resize' },
  { position: ['top', 'left'], cursor: 'nwse-resize' },
  { position: ['bottom', 'right'], cursor: 'nwse-resize' },
  { position: ['top', 'right'], cursor: 'nesw-resize' },
  { position: ['bottom', 'left'], cursor: 'nesw-resize' },
]

export default defineComponent({
  name: 'App',

  props: {
    imageSource: {
      type: HTMLImageElement,
      required: true,
    },
  },

  components: {
    InfoBox,
  },

  setup(props) {
    const canvasRef = ref(null as Nullable<HTMLCanvasElement>)
    const wrapRef = ref(null as Nullable<HTMLDivElement>)
    const captureLayer: CaptureLayer = reactive({ x: 0, y: 0, h: 0, w: 0 })
    const action = ref(<Nullable<CaptureActionType>>null)
    let cursorDownPoint: Nullable<Point> = null
    const mousePoint = ref(<Nullable<Point>>null)
    const RGB = ref('0, 0, 0')
    let cloneCaptureLayer = cloneDeep(captureLayer)
    let resizeMode: Array<ResizePointPosition> = []
    let stylesheet: Nullable<HTMLStyleElement> = null
    const infoBoxVisible = computed(
      () => action.value && ['CREATE', 'RESIZE'].includes(action.value),
    )

    // CSSStyleDeclaration
    const captureLayerStyle = computed(() => {
      const { x, y, h, w } = captureLayer
      const [left, top, height, width] = [x, y, h, w].map((n) => `${n}px`)
      const style = { left, top, height, width }
      return style
    })

    const ctx = computed(() => canvasRef.value?.getContext('2d'))

    watch(
      mousePoint,
      rafThrottle((point: Point) => {
        if (!ctx.value || !point) return
        const { data } = ctx.value.getImageData(point[0], point[1], 1, 1)
        RGB.value = data.slice(0, 3).join(', ')
      }),
    )

    const updateBound = rafThrottle(async function() {
      const { clientHeight, clientWidth } = document.body
      bound.x.max = clientWidth
      bound.y.max = clientHeight
      await nextTick()
      ctx.value!.drawImage(props.imageSource, 0, 0)
    })

    function startCapture(e: MouseEvent) {
      const { x, y } = e
      Object.assign(captureLayer, { x, y })
      action.value = 'CREATE'
      createCSSRule(
        '*',
        `cursor: crosshair !important;`,
        (stylesheet = createStyleSheet()),
      )
      startAction(e)
    }

    function startMove(e: MouseEvent) {
      action.value = 'MOVE'
      createCSSRule(
        '*',
        `cursor: move !important;`,
        (stylesheet = createStyleSheet()),
      )
      startAction(e)
    }

    function startResize(e: MouseEvent, { position, cursor }: ResizePoint) {
      action.value = 'RESIZE'
      resizeMode = position
      createCSSRule(
        '*',
        `cursor: ${cursor} !important;`,
        (stylesheet = createStyleSheet()),
      )
      startAction(e)
    }

    function startAction(e: MouseEvent) {
      cloneCaptureLayer = cloneDeep(captureLayer)
      e.stopImmediatePropagation()
      const { x, y } = e
      cursorDownPoint = [x, y]
      mousePoint.value = [x, y]
      document.addEventListener('mousemove', onMousemoveDocument)
      document.addEventListener('mouseup', onMouseupDocument)
      document.onselectstart = () => false
    }

    function onMousemoveDocument(e: MouseEvent) {
      if (!cursorDownPoint || !action.value) return
      const [x0, y0] = cursorDownPoint
      const x1 = Math.min(Math.max(e.x, bound.x.min), bound.x.max)
      const y1 = Math.min(Math.max(e.y, bound.y.min), bound.y.max)
      const [dx, dy] = [x1 - x0, y1 - y0]
      mousePoint.value = [x1, y1]
      switch (action.value) {
        case 'CREATE':
          const [x, y] = [Math.min(x0, x1), Math.min(y0, y1)]
          const [mw, mh] = [Math.abs(dx), Math.abs(dy)]
          const [w, h] = [
            Math.min(mw, bound.x.max - x),
            Math.min(mh, bound.y.max - y),
          ]
          Object.assign(captureLayer, { x, y, w, h })
          break
        case 'MOVE': {
          const { x: x2, y: y2 } = cloneCaptureLayer
          const { h, w } = captureLayer
          captureLayer.x = Math.min(
            Math.max(x2 + dx, bound.x.min),
            bound.x.max - w,
          )
          captureLayer.y = Math.min(
            Math.max(y2 + dy, bound.y.min),
            bound.y.max - h,
          )
          break
        }
        case 'RESIZE': {
          const { h: h2, y: y2, w: w2, x: x2 } = cloneCaptureLayer
          if (resizeMode.includes('top')) {
            captureLayer.y = Math.min(y1, y2 + h2)
            captureLayer.h = Math.abs(y2 - y1 + h2)
          } else if (resizeMode.includes('bottom')) {
            captureLayer.y = Math.min(y1, y2)
            captureLayer.h = Math.abs(y1 - y2)
          }
          if (resizeMode.includes('left')) {
            captureLayer.x = Math.min(x1, x2 + w2)
            captureLayer.w = Math.abs(x2 - x1 + w2)
          } else if (resizeMode.includes('right')) {
            captureLayer.x = Math.min(x1, x2)
            captureLayer.w = Math.abs(x1 - x2)
          }
        }
        default:
          break
      }
    }
    function onMouseupDocument() {
      cursorDownPoint = null
      document.onselectstart = null
      action.value = null
      stylesheet?.parentNode?.removeChild(stylesheet)
      document.removeEventListener('mousemove', onMousemoveDocument)
      document.removeEventListener('mouseup', onMouseupDocument)
    }

    onMounted(() => {
      addResizeListener(document.body as any, updateBound)
      once(wrapRef.value!, 'mousedown', <EventListener>startCapture)
    })
    onUnmounted(() => {
      removeResizeListener(document.body as any, updateBound)
    })

    return {
      startCapture,
      startMove,
      startResize,

      captureLayerStyle,
      mousePoint,
      RESIZE_POINTS,
      RGB,
      captureLayer,
      infoBoxVisible,
      bound,

      canvasRef,
      wrapRef,
    }
  },
})
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.wrapper {
  overflow: auto;
  cursor: crosshair;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  > canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
}
.capture-layer {
  position: absolute;
  box-shadow: 0 0 0 9999px rgba($color: #000, $alpha: 0.4);
  z-index: 1;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid skyblue;
  left: -999px;
  top: -999px;
}
.resize-point {
  position: absolute;
  width: 7px;
  height: 7px;
  background-color: skyblue;
}
</style>
