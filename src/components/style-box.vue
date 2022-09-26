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

<script lang="ts" setup>
import { createPopper } from '@popperjs/core';
import type { Instance as PopperInstance } from '@popperjs/core';
import { computed, onMounted, onUnmounted, ref, toRef, watch } from 'vue';
import { hsvFormatHex } from 'src/util/color';
import { debounce, range } from 'lodash';
import { ClickOutside as VClickOutside } from 'src/directives';
import ColorPick from './color-pick.vue';

const COLORS = [
  '#000000',
  ...range(18).map((i) => hsvFormatHex(20 * i)),
  '#ffffff',
];
const WIDTHS = [2, 4, 6];

const props = withDefaults(
  defineProps<{
    reference?: HTMLElement;
    visibility: boolean;
    color?: string;
    width?: number;
  }>(),
  {
    visibility: true,
  }
);
const emits = defineEmits<{
  (e: 'update:color', value?: string): void;
  (e: 'update:width', value?: number): void;
}>();

const visibility = toRef(props, 'visibility');
const popperRef = ref<HTMLElement>();

const refColor = computed({
  get: () => props.color,
  set: (val) => emits('update:color', val),
});
const colorPickVisibility = ref(false);
let popperInstance: PopperInstance | undefined;

function initializePopper() {
  if (!visibility.value) return;
  popperInstance = createPopper(props.reference!, popperRef.value!, {
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
    ],
  });
  popperInstance.update();
}
function togglePicker(value = !colorPickVisibility.value) {
  colorPickVisibility.value = value;
}

const debounceTogglePicker = debounce(togglePicker, 100);

function hide() {
  debounceTogglePicker(false);
}

watch(visibility, initializePopper);
onMounted(() => {
  initializePopper();
});
onUnmounted(() => {
  popperInstance?.destroy();
  popperInstance = undefined;
});
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
    background-color: #ededed;
    border-color: #999;
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
