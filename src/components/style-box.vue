<template>
  <div ref="popperRef" class="style-box">
    <template v-if="width">
      <button
        v-for="w in WIDTHS"
        :key="w"
        :class="['width__button', w === width && 'active']"
        :style="`--size-width-height: ${w}px;`"
        @click="$emit('update:width', w)"
      ></button>
    </template>
    <div v-if="color" class="color-box">
      <button
        class="select-color"
        :style="{ backgroundColor: color }"
        :title="color"
        @click="togglePicker()"
      ></button>
      <button
        v-for="c in COLORS"
        :key="c"
        :title="c"
        class="color__button"
        :style="{ backgroundColor: c }"
        :data-color="c"
        @click="$emit('update:color', c)"
      ></button>
      <color-pick
        v-if="colorPickVisibility"
        v-model="refColor"
        v-click-outside="hide"
        :reference="popperRef"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { createPopper } from '@popperjs/core'
import type { Instance as PopperInstance } from '@popperjs/core'
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  toRefs,
  watch,
} from 'vue'
import type { PropType } from 'vue'
import { hsvFormatHex } from 'src/util/color'
import { debounce, range } from 'lodash'
import { ClickOutside } from 'src/directives'
import ColorPick from './color-pick.vue'

const COLORS = ['#000000', ...range(18).map(i => hsvFormatHex(20 * i)), '#ffffff']
const WIDTHS = [2, 4, 6]

export default defineComponent({
  name: 'StyleBox',

  directives: { ClickOutside },

  components: { ColorPick },

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
    },
    width: {
      type: Number,
    },
  },

  emits: ['update:color', 'update:width'],

  setup(props, { emit }) {
    const { visibility, reference } = toRefs(props)
    const popperRef = ref(<RefElement>null)
    // ref(<Nullable<ComponentPublicInstance>>null)
    const refColor = computed({
      get: () => props.color,
      set: val => emit('update:color', val),
    })
    const colorPickVisibility = ref(false)
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
    function togglePicker(value = !colorPickVisibility.value) {
      colorPickVisibility.value = value
    }

    const debounceTogglePicker = debounce(togglePicker, 100)

    function hide() {
      debounceTogglePicker(false)
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
      colorPickVisibility,

      popperRef,
      refColor,

      togglePicker,
      hide,
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
  border: 1px solid #ccc;
  margin: auto;
  box-sizing: border-box;
  border-radius: 0;
}
.color__button {
  width: 12px;
  height: 12px;
  border: 1px solid #ccc;
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
