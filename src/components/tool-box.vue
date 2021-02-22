<template>
  <div ref="toolBoxRef" class="tool-box" :style="style">
    <button
      v-for="t in TOOL_ACTIONS"
      :key="t.id"
      :class="['tool-item', action === t.id && 'active']"
      :title="t.label"
      @click="handleUpdateTool(t.id)"
    >
      {{ t.icon }}
    </button>
    <div class="tool-divider"></div>
    <button
      v-for="t in OPT_ACTIONS"
      :key="t.id"
      class="tool-item"
      :title="t.label"
      @click="handleExecCmd(t.id)"
    >
      {{ t.icon }}
    </button>
  </div>
</template>

<script lang="ts">
import {
  action,
  actionHistory,
  bound,
  canvasRef,
  captureLayer,
  imageSource,
  inited,
  updateDrawBound,
} from 'src/store'
import type {
  CmdAction,
  CmdActionType,
  ToolAction,
  ToolActionType,
} from 'src/type'
import {
  copyCanvas,
  downloadCanvas,
  updateCanvas,
  writeCanvasToClipboard,
} from 'src/util/canvas'
import { addResizeListener, loadLocalImage, loadScreenCaptureImage, removeResizeListener } from 'src/util/dom'
import { createNotification, rafThrottle } from 'src/util/util'
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
} from 'vue'

const OFFSET = { X: 0, Y: 6 }

const TOOL_ACTIONS: Array<ToolAction> = [
  { icon: 'A', label: '添加文字(TODO)', id: 'TEXT', cursor: 'text' },
  { icon: '⬜', label: '矩形工具', id: 'RECT' },
  { icon: '⚪', label: '椭圆工具', id: 'ELLIPSE' },
  { icon: '╱', label: '直线工具', id: 'LINE' },
  { icon: '↗', label: '箭头工具', id: 'ARROW' },
  { icon: '🖊', label: '笔刷工具', id: 'BRUSH' }, // 🐎🐴
  { icon: '🐴', label: '马赛克工具(TODO)', id: 'MOSAIC' },
]

const OPT_ACTIONS: Array<CmdAction> = [
  { icon: '↩', label: '撤销', id: 'RETURN' },
  { icon: '⚡', label: '更换底图(使用本地文件)', id: 'USE_UPLOAD_FILE' },
  { icon: '✂', label: '更换底图(使用屏幕快照)', id: 'USE_SCREEN_CAPTURE' },
  { icon: '⬇', label: '保存(下载图片)', id: 'SAVE' },
  { icon: '❌', label: '取消', id: 'CANCEL' },
  { icon: '✔', label: '确定(复制到剪切板)', id: 'CONFIRM' },
]

export default defineComponent({
  name: 'ToolBox',

  emits: ['dispatch'],

  setup(props, context) {
    const toolBoxRef = ref(<Nullable<HTMLDivElement>>null)
    const clientRect = reactive({ w: 0, h: 0 })
    const style = computed(() => {
      const style = <{ [key: string]: string; }>{}
      const visible = inited.value && action.value !== 'CREATE'
      if (visible) {
        const { x, y, w, h } = captureLayer
        const top =
          y + h + OFFSET.Y + clientRect.h + OFFSET.Y > bound.y.max
            ? Math.max(y - clientRect.h - OFFSET.Y, bound.y.min)
            : y + h + OFFSET.Y
        const left = Math.max(
          x + w - clientRect.w - OFFSET.X,
          bound.x.min + OFFSET.X,
        )
        style.left = `${left}px`
        style.top = `${top}px`
      } else {
        style.visibility = 'hidden'
      }
      return style
    })
    const updateClientRect = rafThrottle(function() {
      const { width: w, height: h } = toolBoxRef.value!.getBoundingClientRect()
      Object.assign(clientRect, { w, h })
    })
    function handleExecCmd(cmd: CmdActionType) {
      switch (cmd) {
        case 'SAVE': {
          const { x, y, w, h } = captureLayer
          downloadCanvas(canvasRef.value!, x, y, w, h)
          break
        }
        case 'CONFIRM': {
          const { x, y, w, h } = captureLayer
          writeCanvasToClipboard(copyCanvas(canvasRef.value!, x, y, w, h))
            .then(() => {
              createNotification({ body: '图片已复制' }, '提示')
            }, err => {
              createNotification({ body: err?.message ?? '图片复制失败' }, '提示')
            })
          break
        }
        case 'RETURN': {
          if (actionHistory.length === 0) break
          actionHistory.pop()
          updateCanvas(actionHistory)
          updateDrawBound()
          break
        }
        case 'CANCEL': {
          actionHistory.length = 1
          handleExecCmd('RETURN')
          Object.assign(captureLayer, { x: -999, y: -999, h: 0, w: 0 })
          break
        }
        case 'USE_UPLOAD_FILE': {
          const oldSrc = imageSource.src
          loadLocalImage(imageSource).then(() => {
            actionHistory.length = 0
            updateCanvas(actionHistory)
            URL.revokeObjectURL(oldSrc)
          })
          break
        }
        case 'USE_SCREEN_CAPTURE': {
          const oldSrc = imageSource.src
          loadScreenCaptureImage(imageSource).then(() => {
            actionHistory.length = 0
            updateCanvas(actionHistory)
            URL.revokeObjectURL(oldSrc)
          })
          break
        }
        default:
          console.log('TODO EXEC CMD => ', cmd)
          return
      }
      context.emit('dispatch', cmd)
    }
    function handleUpdateTool(tool: ToolActionType) {
      action.value = action.value === tool ? null : tool
    }
    onMounted(() => {
      addResizeListener(toolBoxRef.value as any, updateClientRect)
    })
    onUnmounted(() => {
      removeResizeListener(toolBoxRef.value as any, updateClientRect)
    })

    return {
      TOOL_ACTIONS,
      OPT_ACTIONS,

      style,
      action,

      handleExecCmd,
      handleUpdateTool,

      toolBoxRef,
    }
  },
})
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
  &.active,
  &:hover {
    background-color: #f7f7f7;
    border-color: skyblue;
  }
}
.tool-divider {
  height: 24px;
  width: 1px;
  background-color: gray;
  margin: 0 6px;
}
</style>
