<template>
  <div ref="popperRef" class="style-box">
    <button
      v-for="w in WIDTHS"
      :key="w"
      :class="['width__button', w === width && 'active']"
      :style="`--size-width-height: ${w}px;`"
      @click="$emit('update:width', w)"
    ></button>
    <div class="color-box">
      <button class="select-color" :style="{ backgroundColor: color }"></button>
      <button
        v-for="c in COLORS"
        :key="c"
        class="color__button"
        :style="{ backgroundColor: c }"
        :data-color="c"
        @click="$emit('update:color', c)"
      ></button>
    </div>
  </div>
</template>

<script lang="ts">
import { createPopper } from '@popperjs/core'
import type { Instance as PopperInstance } from '@popperjs/core'
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  toRefs,
  watch,
} from 'vue'
import type { PropType } from 'vue'
import { hsvFormatHex } from 'src/util/color'

// const BASE_COLOR = parseInt('fff', 16) / 15
const COLORS = ['#000', ...[...Array(18)].map((_, i) => hsvFormatHex(20 * i)), '#fff']
const WIDTHS = [2, 4, 6]

export default defineComponent({
  name: 'StyleBox',

  props: {
    reference: {
      type: Object as PropType<Nullable<HTMLElement>>,
      required: true,
    },
    visibility: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: '#ff0000',
    },
    width: {
      type: Number,
      default: 2,
    },
  },

  emits: ['update:color', 'update:width'],

  setup(props) {
    const { visibility, reference } = toRefs(props)
    const popperRef = ref(<RefElement>null)
    let popperInstance = <Nullable<PopperInstance>>null
    function initializePopper() {
      if (!visibility.value) return
      popperInstance = createPopper(reference.value!, popperRef.value!, {
        placement: 'bottom-start',
        modifiers: [{
          name: 'offset',
          options: {
            offset: [0, 4],
          },
        }],
      })
      popperInstance.update()
    }
    watch(visibility, initializePopper)
    onMounted(() => {
      initializePopper()
    })
    onUnmounted(() => {
      popperInstance?.destroy()
    })

    return {
      COLORS,
      WIDTHS,

      popperRef,
    }
  },
})
</script>

<style lang="scss">
.style-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  position: absolute;
  left: -999px;
  top: -999px;
  padding: 0 6px;
  z-index: 1;
  user-select: none;
  cursor: default;
}
.width__button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  background-color: transparent;
  border: 1px solid transparent;
  outline: 0;
  box-sizing: border-box;
  &::after {
    content: '';
    border-radius: 50%;
    background-color: #666;
    width: var(--size-width-height);
    height: var(--size-width-height);
  }
  &:hover {
    background-color: #f7f7f7;
    border-color: #aaa;
  }
  &.active {
    background-color: #eee;
    border-color: #ccc;
  }
}
.color-box {
  display: grid;
  grid-template-columns: repeat(auto-fill, 16px);
  width: 192px;
  height: 32px;
}
.select-color {
  grid-column: 1 / span 2;
  grid-row: 1 / span 2;
  width: 28px;
  height: 28px;
  border: 1px solid #333;
  margin: auto;
  box-sizing: border-box;
  border-radius: 0;
}
.color__button {
  width: 12px;
  height: 12px;
  border: 1px solid #333;
  padding: 0;
  margin: auto;
  box-sizing: border-box;
  outline: 0;
  border-radius: 0;
  &:hover {
    transform: scaleX(1.2) scaleY(1.2);
  }
}
</style>
