import { reactive, ref } from 'vue'
import { Bound } from './type'

export const blob = ref('')

export const bound: Bound = reactive({
  x: { min: 0, max: 0 },
  y: { min: 0, max: 0 },
})
