<template>
  <div class="capture-info__wrap" :style="style">
    <div class="capture-info__view">
      <canvas ref="canvasRef" :width="DW" :height="DH"></canvas>
      <svg viewBox="0 0 120 88" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M 0 1 H 119 V87 H1 V1" stroke="red" stroke-width="2" />
        <path d="M 0 44 H 119" stroke="red" stroke-width="2" />
        <path d="M 60 0 V 88" stroke="red" stroke-width="2" />
      </svg>
    </div>
    <div class="capture-info__p">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs, watch, toRef } from 'vue'
import { bound } from 'src/store'
import { Point } from 'src/type'
import { throttle } from 'lodash'

const SIZE = 120
const OFFSET = { X: 10, Y: 10 }
const ZOOM_FACTOR = 4
const [DW, DH] = [120, 88]
const [SW, SH] = [DW / ZOOM_FACTOR, DH / ZOOM_FACTOR]

const props = defineProps<{
  mousePoint?: Point,
  canvas?: HTMLCanvasElement
}>()
const mousePoint = toRef(props, 'mousePoint')

const canvasRef = ref<HTMLCanvasElement>()
const style = computed(() => {
  const style = <{ [key: string]: string; }>{}
  if (mousePoint?.value) {
    const [x, y] = mousePoint.value
    const [w, h] = [OFFSET.X + SIZE, OFFSET.Y + SIZE]
    const left = x + w > bound.x.max ? x - w : x + OFFSET.X
    const top = y + h > bound.y.max ? y - h : y + OFFSET.Y
    style.left = `${left}px`
    style.top = `${top}px`
  }
  return style
})

watch(mousePoint, throttle((point) => {
  const { canvas } = props
  if (!point || !canvas || !canvasRef.value) return
  const [x, y] = point
  const ctx = canvasRef.value.getContext('2d')!
  ctx.clearRect(0, 0, DW, DH)
  ctx.drawImage(canvas, x - SW / 2, y - SH / 2, SW, SH, 0, 0, DW, DH)
}))
</script>

<style lang="scss" scoped>
.capture-info__wrap {
  width: 120px;
  height: 120px;
  // position: fixed;
  outline: 1px solid #000;
  position: absolute;
  z-index: 2;
}
.capture-info__view {
  // border: 2px solid #fff;
  height: 88px;
  box-sizing: border-box;
  position: relative;
  > canvas {
    width: 100%;
    height: 100%;
  }
  > svg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.8;
  }
}
.capture-info__p {
  height: 32px;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  background-color: rgba($color: #000, $alpha: 0.8);
}
</style>
