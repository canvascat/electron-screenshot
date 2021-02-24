import { createApp } from 'vue'
import App from './App.vue'
import { imageSource } from './store'
import { loadImage } from './util/dom'

if (import.meta.env.PROD) {
  (<any>window)._hmt ??= []
  const hm = document.createElement('script')
  hm.src = 'https://hm.baidu.com/hm.js?4e02e53abd8605530e0c10481dabdca0'
  const s = document.querySelector('script')
  s!.parentNode!.insertBefore(hm, s)
}

import('./assets/IMG_303.jpeg')
  .then(res => fetch(res.default))
  .then(r => r.blob())
  .then(async b => {
    await loadImage(URL.createObjectURL(b), imageSource)
    createApp(App).mount('#app')
  })
