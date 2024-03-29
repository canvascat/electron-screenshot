<template>
  <div ref="toolBoxRef" class="tool-box" :style="style">
    <button v-for="t in TOOL_ACTIONS" :key="t.id" :class="['tool-item', action === t.id && 'active']" :title="t.label"
      @click="handleUpdateTool(t.id)">
      {{ t.icon }}
    </button>
    <div class="tool-divider"></div>
    <button v-for="t in OPT_ACTIONS" :key="t.id" class="tool-item" :title="t.label" @click="handleExecCmd(t.id)">
      {{ t.icon }}
    </button>
  </div>
  <StyleBox v-if="showStyleBox" :visibility="showStyleBox" v-model:color="currentTool!.attr!.color"
    v-model:width="currentTool!.attr!.width" :reference="toolBoxRef" />
</template>

<script lang="ts" setup>
import StyleBox from './style-box.vue';
import {
  action,
  actionHistory,
  bound,
  captureLayer,
  initialized,
  TOOL_ACTIONS,
  updateDrawBound,
} from '@/store';
import type { CmdActionType, ToolActionType } from '@/type';
import {
  copyCanvas,
  downloadCanvas,
  writeCanvasToClipboard,
} from '@/util/canvas';
import {
  addResizeListener,
  loadLocalImage,
  loadScreenCaptureImage,
  removeResizeListener,
} from '@/util/dom';
import { createNotification } from '@/util/util';
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  type CSSProperties,
} from 'vue';
import { throttle } from 'lodash';
import { useCanvasStore } from '@/stores/canvas';
import { OPT_ACTIONS } from '@/const';

const store = useCanvasStore();

const OFFSET = { X: 0, Y: 6 };

const emits = defineEmits<{
  (e: 'dispatch', cmd: CmdActionType): void;
}>();

const toolBoxRef = ref<HTMLDivElement>();
const clientRect = reactive({ w: 0, h: 0 });
const style = computed(() => {
  const style: CSSProperties = {};
  const visible = initialized.value && action.value !== 'CREATE';
  if (visible) {
    const { x, y, w, h } = captureLayer;
    const top =
      y + h + OFFSET.Y + clientRect.h + OFFSET.Y > bound.y.max
        ? Math.max(y - clientRect.h - OFFSET.Y, bound.y.min)
        : y + h + OFFSET.Y;
    const left = Math.max(
      x + w - clientRect.w - OFFSET.X,
      bound.x.min + OFFSET.X
    );
    style.left = `${left}px`;
    style.top = `${top}px`;
  } else {
    style.visibility = 'hidden';
  }
  return style;
});
// const SHOW_STYLE_BOX_TOOL_IDS = ['LINE','RECT', 'ARROW', 'ELLIPSE', 'BRUSH']
const currentTool = computed(() =>
  TOOL_ACTIONS.find(({ id }) => id === action.value)
);
const showStyleBox = computed(() => !!currentTool.value?.attr);

const updateClientRect = throttle(function () {
  const { width: w, height: h } = toolBoxRef.value!.getBoundingClientRect();
  Object.assign(clientRect, { w, h });
});
function handleExecCmd(cmd: CmdActionType) {
  switch (cmd) {
    case 'SAVE': {
      const { x, y, w, h } = captureLayer;
      downloadCanvas(store.main!, x, y, w, h);
      break;
    }
    case 'CONFIRM': {
      const { x, y, w, h } = captureLayer;
      writeCanvasToClipboard(copyCanvas(store.main!, x, y, w, h)).then(
        () => {
          createNotification({ body: '图片已复制' }, '提示');
        },
        (err) => {
          createNotification({ body: err?.message ?? '图片复制失败' }, '提示');
        }
      );
      break;
    }
    case 'RETURN': {
      if (actionHistory.length === 0) break;
      actionHistory.pop();
      store.updateMain(actionHistory);
      updateDrawBound();
      break;
    }
    case 'CANCEL': {
      actionHistory.length = 1;
      handleExecCmd('RETURN');
      Object.assign(captureLayer, { x: -999, y: -999, h: 0, w: 0 });
      break;
    }
    case 'USE_UPLOAD_FILE': {
      store.setSource('file').then(() => {
        actionHistory.length = 0;
        store.updateMain(actionHistory);
      });
      break;
    }
    case 'USE_SCREEN_CAPTURE': {
      store.setSource('screenCapture').then(() => {
        actionHistory.length = 0;
        store.updateMain(actionHistory);
      });
      break;
    }
    default:
      console.log('TODO EXEC CMD => ', cmd);
      return;
  }
  emits('dispatch', cmd);
}
function handleUpdateTool(tool: ToolActionType) {
  action.value = action.value === tool ? undefined : tool;
}
onMounted(() => {
  addResizeListener(toolBoxRef.value as any, updateClientRect);
});
onUnmounted(() => {
  removeResizeListener(toolBoxRef.value as any, updateClientRect);
});
</script>

<style lang="scss">
.tool-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  position: absolute;
  height: 36px;
  padding: 0 6px;
  z-index: 1;
  user-select: none;
  cursor: default;
}

.tool-item {
  height: 24px;
  width: 24px;
  margin: 4px;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms;
  border-radius: 2px;
  border: 1px solid transparent;
  background-color: transparent;
  outline: 0;

  &:hover {
    background-color: #f7f7f7;
    border-color: #aaa;
  }

  &.active {
    background-color: #ededed;
    border-color: #999;
  }
}

.tool-divider {
  height: 24px;
  width: 1px;
  background-color: gray;
  margin: 0 6px;
}
</style>
