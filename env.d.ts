/// <reference types="vite/client" />

declare interface HTMLCanvasElement {
  /** https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/transferControlToOffscreen */
  transferControlToOffscreen: () => OffscreenCanvas;
}

/** https://developer.mozilla.org/zh-CN/docs/Web/API/OffscreenCanvas */
declare interface OffscreenCanvas
  extends MessagePort,
  Pick<HTMLCanvasElement, 'height' | 'width' | 'getContext' | 'toBlob'> {
  /** https://developer.mozilla.org/zh-CN/docs/Web/API/OffscreenCanvas/transferToImageBitmap */
  transferToImageBitmap: () => ImageBitmap;
}
