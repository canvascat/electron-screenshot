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

import('./assets/bigbadfox1080p.mkv_20201108_104416.220.jpg')
  .then(res => fetch(res.default))
  .then(r => r.blob())
  .then(async b => {
    await loadImage(URL.createObjectURL(b), imageSource)
    createApp(App).mount('#app')
  })
