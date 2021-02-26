<template>
  <div ref="popperRef" class="color-picker flex-conter">
    <div ref="hueRef" class="hue-bar"></div>
    <div class="color-svpanel__wrap flex-conter">
      <div ref="svRef" class="color-svpanel flex-conter" :style="{ backgroundColor: background }">
        <div class="color-svpanel__white"></div>
        <div class="color-svpanel__black"></div>
        <div class="sv__cursor" :style="{ transform: svTransform }"></div>
      </div>
    </div>
    <div class="hue__cursor" :style="{ transform: `translateX(81px) rotate(${hue}deg)` }"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, toRefs, watch } from 'vue'
import type {  PropType } from 'vue'
import draggable from 'src/util/draggable'
import { default as Color } from 'src/util/color'
import { createPopper } from '@popperjs/core'
import type { Instance as PopperInstance } from '@popperjs/core'

export default defineComponent({
  name: 'ColorPick',

  props: {
    modelValue: String,
    reference: {
      type: Object as PropType<Nullable<HTMLElement>>,
      required: true,
    },
    visibility: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const { reference, visibility } = toRefs(props)
    const popperRef = ref(<Nullable<HTMLElement>>null)
    const hueRef = ref(<Nullable<HTMLElement>>null)
    const svRef = ref(<Nullable<HTMLElement>>null)
    const svTransform = ref('')
    const hue  = ref(0)
    let popperInstance = <Nullable<PopperInstance>>null
    const color = reactive(new Color({
      color: props.modelValue || '#ff0000',
    }))

    const background = computed(() => 'hsl(' + color.hue + ', 100%, 50%)')

    function handleHueDrag (evt: MouseEvent) {
      const el = hueRef.value
      if (!el) return
      const rect = el.getBoundingClientRect()
      const [x0, y0] = [rect.left + rect.width / 2, rect.top + rect.height / 2]
      const [dx, dy] = [evt.x - x0, evt.y - y0]
      hue.value = Math.floor(Math.atan(dy / dx) * 180 / Math.PI)
      if (dx < 0) hue.value += 180
      if (hue.value < 0) hue.value += 360
      color.update({ hue: hue.value })
    }
    function handleSvDrag(event: MouseEvent) {
      const el = svRef.value
      if (!el) return
      const rect = el.getBoundingClientRect()
      const top = Math.min(Math.max(0, event.clientY - rect.top), rect.height)
      const left = Math.min(Math.max(0, event.clientX - rect.left), rect.width)
      const { width, height } = rect
      color.update({
        saturation: left / width * 100,
        value: 100 - top / height * 100,
      })
    }
    watch(() => props.modelValue, val => {
      val && color.fromString(val)
    })
    watch(() => color.color, val => {
      emit('update:modelValue', val)
    })
    watch([() => color.value, () => color.saturation], () => {
      updateSv()
    })

    function updateSv() {
      const { saturation, value } = color

      const el = svRef.value
      if (!el) return
      const { clientWidth: width, clientHeight: height } = el
      const [left, top] = [saturation * width / 100, (100 - value) * height / 100]
      const [x, y] = [left - width / 2, top - height / 2]

      svTransform.value = `translateX(${x}px) translateY(${y}px)`
    }

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
      draggable(hueRef.value!, handleHueDrag)
      draggable(svRef.value!, handleSvDrag)
      updateSv()
      initializePopper()
    })
    return {
      popperRef,
      hueRef,
      svRef,

      hue,
      background,
      svTransform,
      color,
    }
  },
})
</script>

<style lang="scss">
.flex-conter {
  display: flex;
  align-items: center;
  justify-content: center;
}
.color-picker {
  width: 240px;
  height: 200px;
  border: 1px solid #f7f7f7;
  background-color: #fff;
  .hue-bar {
    border: 1px solid #acacac;
    width: 180px;
    height: 180px;
    position: absolute;
    border-radius: 50%;
    background: conic-gradient(
      from 0.25turn at 50% 50%,
      red 0,
      #ff0 17%,
      #0f0 33%,
      #0ff 50%,
      #00f 67%,
      #f0f 83%,
      red
    );
  }
}
.color-svpanel__wrap {
  width: 140px;
  height: 140px;
  position: absolute;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #acacac;
}
.color-svpanel {
  background-color: red;
  outline: 1px solid #acacac;
}
.color-svpanel,
.color-svpanel__white,
.color-svpanel__black {
  /* 140 / (2 ** 0.5) */
  width: 98px;
  height: 98px;
  position: absolute;
}
.color-svpanel__white {
  background: linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0));
}
.color-svpanel__black {
  background: linear-gradient(0deg, #000, transparent);
}
.hue__cursor,
.sv__cursor {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-sizing: border-box;
  box-shadow: 0 0 0 1.5px rgb(49, 46, 46), inset 0 0 1px 1px rgb(0 0 0 / 30%),
    0 0 1px 2px rgb(0 0 0 / 40%);
  position: absolute;
  // filter: invert(1);
}
.hue__cursor {
  // 81 - 8 / 2
  transform-origin: -77px center;
  transform: translateX(81px) rotate(0deg);
  pointer-events: none;
}
</style>
