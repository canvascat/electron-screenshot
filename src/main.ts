import { random } from 'lodash';
import { createApp } from 'vue';
import App from './App.vue';
import { imageSource } from './store';
import { loadImage } from './util/dom';

if (import.meta.env.PROD) {
  (<any>window)._hmt ??= [];
  const hm = document.createElement('script');
  hm.src = 'https://hm.baidu.com/hm.js?4e02e53abd8605530e0c10481dabdca0';
  const s = document.querySelector('script');
  s!.parentNode!.insertBefore(hm, s);
}

async function createRandomImage(input?: string) {
  if (!input) {
    const modules = Object.values(
      import.meta.glob<false, '*.jpg', { default: string }>('./assets/*.jpg')
    );
    const importModule = modules[random(modules.length) - 1];
    const module = await importModule();
    input = module.default;
  }
  const response = await fetch(input);
  return await response.blob();
}

createRandomImage('/src/assets/2021-09-16 115153.png')
  .then((b) => loadImage(URL.createObjectURL(b), imageSource))
  .then(() => createApp(App).mount('#app'));
