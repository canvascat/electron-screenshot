import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { createCanvasImageSource } from '@/util/dom';
import { updateCanvas } from '@/util/canvas';
import type { ActionHistoryItem } from '@/type';

export const useCanvasStore = defineStore('canvas', () => {
  const source = ref<ImageBitmap>();
  const min = ref<HTMLCanvasElement>();
  const main = ref<HTMLCanvasElement>();
  const selection = ref<HTMLCanvasElement>();

  const mainContext = computed(() => main.value?.getContext('2d') || undefined);
  const minContext = computed(() => min.value?.getContext('2d') || undefined);

  const setSource = async (
    type: 'file' | 'screenCapture' | 'url',
    url?: string
  ) => {
    const value = await createCanvasImageSource(type, url);
    source.value?.close();
    source.value = value;
  };

  const updateMain = (actions: ActionHistoryItem[]) => {
    if (!mainContext.value || !source.value) return;
    updateCanvas(actions, mainContext.value, source.value);

    console.log(mainContext.value.getImageData(0, 1080, 100, 100).data);
  };

  return {
    source,
    min,
    main,
    selection,
    mainContext,
    minContext,
    setSource,
    updateMain,
  };
});
