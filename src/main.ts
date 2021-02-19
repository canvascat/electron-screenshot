import { createApp } from 'vue'
import App from './App.vue'
import { imageSource } from './store'

import('./assets/bigbadfox1080p.mkv_20201108_104416.220.jpg')
  .then((res) => fetch(res.default))
  .then((r) => r.blob())
  .then((b) => {
    imageSource.src = URL.createObjectURL(b)
    imageSource.onload = () => createApp(App).mount('#app')
  })
