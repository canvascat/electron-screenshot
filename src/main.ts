import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { createImageURL } from './util/mock';
import { useCanvasStore } from './stores/canvas';

if (import.meta.env.PROD) {
  (<any>window)._hmt ??= [];
  const hm = document.createElement('script');
  hm.src = 'https://hm.baidu.com/hm.js?4e02e53abd8605530e0c10481dabdca0';
  const s = document.querySelector('script');
  s!.parentNode!.insertBefore(hm, s);
}

(async () => {
  const pinia = createPinia();
  const store = useCanvasStore(pinia);
  await store.setSource('url', createImageURL());
  const app = createApp(App);
  app.use(pinia);
  app.mount('#app');
})();
