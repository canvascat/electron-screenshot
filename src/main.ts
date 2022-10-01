import { createApp } from 'vue';
import App from './App.vue';
import { updateSource } from './store';
import { createImageURL } from './util/mock';

if (import.meta.env.PROD) {
  (<any>window)._hmt ??= [];
  const hm = document.createElement('script');
  hm.src = 'https://hm.baidu.com/hm.js?4e02e53abd8605530e0c10481dabdca0';
  const s = document.querySelector('script');
  s!.parentNode!.insertBefore(hm, s);
}

updateSource(createImageURL(/* '/src/assets/2021-09-16 115153.png' */)).then(
  () => createApp(App).mount('#app')
);
