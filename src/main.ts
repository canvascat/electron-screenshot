import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { createImageURL } from './util/mock';
import { useCanvasStore } from './stores/canvas';

if (import.meta.env.PROD) {
  (<any>window)._hmt ??= [];
  const hm = document.createElement('script');
  hm.src = 'https://hm.baidu.com/hm.js?4e02e53abd8605530e0c10481dabdca0';
  document.head.appendChild(hm);
} else {
  import('stats.js').then(({ default: Stats }) => {
    const stats = new Stats();
    const loop = () => (stats.update(), requestAnimationFrame(loop));
    document.body.appendChild(stats.dom);
    requestAnimationFrame(loop);
  });
}

(async () => {
  const pinia = createPinia();
  const store = useCanvasStore(pinia);
  await store.setSource('url', createImageURL());
  const app = createApp(App);
  app.use(pinia);
  app.mount('#app');
})();
