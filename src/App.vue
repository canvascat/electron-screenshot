<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  action,
  actionHistory,
  bound,
  canvasRef,
  captureLayer,
  drawBound,
  getToolById,
  imageSource,
  initialized,
  mosaicOriginalPxData,
  updateDrawBound,
} from '@/store';
import InfoBox from '@/components/info-box.vue';
import ToolBox from '@/components/tool-box.vue';
import type {
  ActionHistoryItem,
  CmdActionType,
  Point,
  ResizePoint,
  ResizePointPosition,
  ToolActionType,
} from '@/type';
import {
  addResizeListener,
  createCSSRule,
  createStyleSheet,
  once,
  removeResizeListener,
} from '@/util/dom';
import { cloneDeep, isEqual, throttle } from 'lodash';
import { createMosaicData, updateCanvas } from '@/util/canvas';
import { CAPTURE_ACTION_IDS, TOOL_ACTION_IDS } from './util/const';

const RESIZE_POINTS: ResizePoint[] = [
  { position: ['top'], cursor: 'ns-resize' },
  { position: ['bottom'], cursor: 'ns-resize' },
  { position: ['left'], cursor: 'ew-resize' },
  { position: ['right'], cursor: 'ew-resize' },
  { position: ['top', 'left'], cursor: 'nwse-resize' },
  { position: ['bottom', 'right'], cursor: 'nwse-resize' },
  { position: ['top', 'right'], cursor: 'nesw-resize' },
  { position: ['bottom', 'left'], cursor: 'nesw-resize' },
];

const wrapRef = ref<HTMLDivElement>();
let cursorDownPoint: Point | undefined;
const mousePoint = ref<Point>();
const RGB = ref('0, 0, 0');
let cloneCaptureLayer = cloneDeep(captureLayer);
let resizeMode: ResizePointPosition[] = [];
let stylesheet: HTMLStyleElement;
const infoBoxVisible = computed(
  () => action.value && ['CREATE', 'RESIZE'].includes(action.value)
);

// CSSStyleDeclaration
const captureLayerStyle = computed(() => {
  const { x, y, h, w } = captureLayer;
  const [left, top, height, width] = [x, y, h, w].map((n) => `${n}px`);
  const style = { left, top, height, width, cursor: '' };
  if (!action.value) style.cursor = 'move';
  return style;
});

const ctx = computed(() => canvasRef.value?.getContext('2d'));

watch(
  mousePoint,
  throttle((point) => {
    if (!ctx.value || !point) return;
    const { data } = ctx.value.getImageData(point[0], point[1], 1, 1);
    RGB.value = data.slice(0, 3).join(', ');
  })
);

const updateBound = throttle(async function () {
  const { clientHeight, clientWidth } = document.body;
  bound.x.max = clientWidth;
  bound.y.max = clientHeight;
  await nextTick();
  updateCanvas(actionHistory, ctx.value!, imageSource);
});

function startCapture(e: MouseEvent) {
  if (e.button !== 0) return initCapture();
  initialized.value = true;
  const { x, y } = e;
  Object.assign(captureLayer, { x, y });
  action.value = 'CREATE';
  createCSSRule(
    '*',
    `cursor: crosshair !important;`,
    (stylesheet = createStyleSheet())
  );
  startAction(e);
}

function startMove(e: MouseEvent) {
  if (action.value) return;
  action.value = 'MOVE';
  createCSSRule(
    '*',
    `cursor: move !important;`,
    (stylesheet = createStyleSheet())
  );
  startAction(e);
}

function onMousedownCaptureLayer(e: MouseEvent) {
  if (!action.value) {
    startMove(e);
  } else if (TOOL_ACTION_IDS.includes(action.value)) {
    const step: ActionHistoryItem = {
      id: action.value as ToolActionType,
      path: [[e.x, e.y]],
    };
    const attr = getToolById(action.value)?.attr;
    attr && Object.assign(step, { attr: cloneDeep(attr) });
    actionHistory.push(step);
    if (action.value === 'MOSAIC') {
      mosaicOriginalPxData.value = createMosaicData(ctx.value!, 10);
    }
    startAction(e);
  }
}

function startResize(e: MouseEvent, { position, cursor }: ResizePoint) {
  action.value = 'RESIZE';
  resizeMode = position;
  createCSSRule(
    '*',
    `cursor: ${cursor} !important;`,
    (stylesheet = createStyleSheet())
  );
  startAction(e);
}

const throttledOnMousemoveDocument = throttle(onMousemoveDocument);

function startAction(e: MouseEvent) {
  cloneCaptureLayer = cloneDeep(captureLayer);
  e.stopImmediatePropagation();
  const { x, y } = e;
  cursorDownPoint = [x, y];
  mousePoint.value = [x, y];
  document.addEventListener('mousemove', throttledOnMousemoveDocument);
  document.addEventListener('mouseup', onMouseupDocument);
  document.onselectstart = () => false;
}

function onMousemoveDocument(e: MouseEvent) {
  if (!cursorDownPoint || !action.value) return;
  const [x0, y0] = cursorDownPoint;
  let x1 = Math.min(Math.max(e.x, bound.x.min), bound.x.max);
  let y1 = Math.min(Math.max(e.y, bound.y.min), bound.y.max);
  const [dx, dy] = [x1 - x0, y1 - y0];
  mousePoint.value = [x1, y1];
  const [lastActionHistory] = actionHistory.slice(-1);
  if (CAPTURE_ACTION_IDS.includes(action.value)) {
    switch (action.value) {
      case 'CREATE': {
        const [x, y] = [Math.min(x0, x1), Math.min(y0, y1)];
        const [mw, mh] = [Math.abs(dx), Math.abs(dy)];
        const [w, h] = [
          Math.min(mw, bound.x.max - x),
          Math.min(mh, bound.y.max - y),
        ];
        Object.assign(captureLayer, { x, y, w, h });
        break;
      }
      case 'MOVE': {
        const { x: x2, y: y2 } = cloneCaptureLayer;
        const { h, w } = captureLayer;
        const db = drawBound.value;
        captureLayer.x = Math.min(
          Math.max(x2 + dx, bound.x.min, (db?.x.max ?? -Infinity) - w),
          bound.x.max - w,
          db?.x.min ?? Infinity
        );
        captureLayer.y = Math.min(
          Math.max(y2 + dy, bound.y.min, (db?.y.max ?? -Infinity) - h),
          bound.y.max - h,
          db?.y.min ?? Infinity
        );
        break;
      }
      case 'RESIZE': {
        const { h: h2, y: y2, w: w2, x: x2 } = cloneCaptureLayer;
        const db = drawBound.value;
        if (resizeMode.includes('top')) {
          y1 = Math.min(y1, db?.y.min ?? Infinity);
          captureLayer.y = Math.min(y1, y2 + h2);
          captureLayer.h = Math.abs(y2 - y1 + h2);
        } else if (resizeMode.includes('bottom')) {
          y1 = Math.max(y1, db?.y.max ?? -Infinity);
          captureLayer.y = Math.min(y1, y2);
          captureLayer.h = Math.abs(y1 - y2);
        }
        if (resizeMode.includes('left')) {
          x1 = Math.min(x1, db?.x.min ?? Infinity);
          captureLayer.x = Math.min(x1, x2 + w2);
          captureLayer.w = Math.abs(x2 - x1 + w2);
        } else if (resizeMode.includes('right')) {
          x1 = Math.max(x1, db?.x.max ?? -Infinity);
          captureLayer.x = Math.min(x1, x2);
          captureLayer.w = Math.abs(x1 - x2);
        }
        break;
      }
      default:
        break;
    }
  } else if (TOOL_ACTION_IDS.includes(action.value)) {
    if (lastActionHistory?.id !== action.value) return;
    const endPoint = pointBoundaryTreatment([x1, y1]);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [lastEndPoint] = lastActionHistory.path!.slice(-1);
    if (isEqual(endPoint, lastEndPoint)) return;
    switch (action.value) {
      case 'LINE': {
        lastActionHistory.path![1] = endPoint;
        break;
      }
      case 'RECT': {
        lastActionHistory.path![1] = endPoint;
        break;
      }
      case 'ARROW': {
        lastActionHistory.path![1] = endPoint;
        break;
      }
      case 'ELLIPSE': {
        lastActionHistory.path![1] = endPoint;
        break;
      }
      case 'BRUSH': {
        // TODO
        // const MIN_POINT_DISTANCE = 5;
        // if (pointDistance(endPoint, lastEndPoint) <= MIN_POINT_DISTANCE)
        //   break;
        lastActionHistory.path!.push(endPoint);
        break;
      }
      case 'MOSAIC': {
        lastActionHistory.path!.push(endPoint);
        break;
      }
      default:
        return;
    }
    updateCanvas(actionHistory, ctx.value!, imageSource);
  }
}

function pointBoundaryTreatment([x0, y0]: Point): Point {
  const { x, y, w, h } = captureLayer;
  return [Math.max(Math.min(x0, x + w), x), Math.max(Math.min(y0, y + h), y)];
}

function onMouseupDocument() {
  cursorDownPoint = undefined;
  document.onselectstart = null;
  stylesheet?.parentNode?.removeChild(stylesheet);
  document.removeEventListener('mousemove', throttledOnMousemoveDocument);
  document.removeEventListener('mouseup', onMouseupDocument);
  if (action.value === 'MOSAIC') {
    mosaicOriginalPxData.value = undefined;
  }
  if (CAPTURE_ACTION_IDS.includes(action.value!)) action.value = undefined;
  // TODO: 清理无效步骤，分情况讨论
  const [lastActionItem] = actionHistory.slice(-1);
  if (
    lastActionItem &&
    lastActionItem.path &&
    lastActionItem.path.length <= 1
  ) {
    actionHistory.pop();
  }
  updateDrawBound();
}

function initCapture() {
  initialized.value = false;
  once(wrapRef.value!, 'mousedown', startCapture);
}

function handleToolCmd(cmd: CmdActionType) {
  switch (cmd) {
    case 'CANCEL':
      initCapture();
      break;
    default:
      break;
  }
}

onMounted(() => {
  addResizeListener(document.body as any, updateBound);
  initCapture();
  // document.body.appendChild(imageSource)
});
onUnmounted(() => {
  removeResizeListener(document.body as any, updateBound);
});
</script>

<template>
  <div ref="wrapRef" class="wrapper">
    <canvas ref="canvasRef" :width="bound.x.max" :height="bound.y.max"></canvas>
    <div class="capture-layer" :style="captureLayerStyle" @mousedown.left="onMousedownCaptureLayer">
      <button v-for="p in RESIZE_POINTS" :key="p.position.join()" :style="
        p.position.reduce((o, p) => Object.assign(o, { [p]: '-3px' }), {
          cursor: p.cursor,
        })
      " class="resize-point" @mousedown.left.prevent="startResize($event, p)"></button>
    </div>
    <info-box v-if="infoBoxVisible" :mouse-point="mousePoint" :canvas="canvasRef">
      <p>{{ captureLayer.w }} x {{ captureLayer.h }}</p>
      <p>RGB({{ RGB }})</p>
    </info-box>
  </div>
  <tool-box @dispatch="handleToolCmd" />
</template>

<style lang="scss">
#app>img {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  display: none;
}

body {
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

  >canvas {
    position: absolute;
    top: 0;
    left: 0;
    background: #eee;
    background-image: linear-gradient(45deg, #bbb 25%, transparent 0),
      linear-gradient(45deg, transparent 75%, #bbb 0),
      linear-gradient(45deg, #bbb 25%, transparent 0),
      linear-gradient(45deg, transparent 75%, #bbb 0);
    background-position: 0 0, 15px 15px, 15px 15px, 30px 30px;
    background-size: 30px 30px;
  }
}

.capture-layer {
  position: absolute;
  box-shadow: 0 0 0 9999px rgba($color: #000, $alpha: 0.4);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: 1px solid skyblue;
}

.resize-point {
  position: absolute;
  width: 7px;
  height: 7px;
  padding: 0;
  border: 0;
  box-sizing: border-box;
  background-color: skyblue;
  border-radius: 0;

  &:focus {
    background-color: brown;
  }
}
</style>
