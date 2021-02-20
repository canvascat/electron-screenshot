import { createApp } from 'vue'
import App from './App.vue'
import { imageSource } from './store'
import { loadImage } from './util/dom'

import('./assets/bigbadfox1080p.mkv_20201108_104416.220.jpg')
  .then(res => fetch(res.default))
  .then(r => r.blob())
  .then(async b => {
    await loadImage(URL.createObjectURL(b), imageSource)
    createApp(App).mount('#app')
  })
