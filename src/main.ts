import { random, range } from 'lodash'
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

Promise.all(range(0, 8).map(i => import(`./assets/${i}.jpg`).then(r => r.default)))
  .then(urls => fetch(urls[random(urls.length) - 1]))
  .then(r => r.blob())
  .then(b => loadImage(URL.createObjectURL(b), imageSource))
  .then(() => createApp(App).mount('#app'))
