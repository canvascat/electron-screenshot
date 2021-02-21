import { getScreenCapture } from './util'

export { addResizeListener, removeResizeListener } from './resize-event'

const trim = function (s: string) {
  return (s || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}

export const on = function (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
  useCapture = false,
): void {
  if (element && event && handler) {
    element.addEventListener(event, handler, useCapture)
  }
}

export const off = function (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
): void {
  if (element && event && handler) {
    element.removeEventListener(event, handler, false)
  }
}

export function once(el: HTMLElement, event: string, fn: EventListener): void {
  const listener = function (this: any, evt: Event) {
    if (fn) fn.call(this, evt)
    off(el, event, listener)
  }
  on(el, event, listener)
}

export function hasClass(el: HTMLElement, cls: string): boolean {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1)
    throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

export function addClass(el: HTMLElement, cls: string): void {
  if (!el) return
  let curClass = el.className
  const classes = (cls || '').split(' ')

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

export function removeClass(el: HTMLElement, cls: string): void {
  if (!el || !cls) return
  const classes = cls.split(' ')
  let curClass = ' ' + el.className + ' '

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

export const stop = (e: Event) => e.stopPropagation()

let _sharedStyleSheet: HTMLStyleElement | null = null
function getSharedStyleSheet(): HTMLStyleElement {
  return (_sharedStyleSheet ??= createStyleSheet())
}

export function createStyleSheet(
  container: HTMLElement = document.getElementsByTagName('head')[0],
): HTMLStyleElement {
  const style = document.createElement('style')
  // style.type = 'text/css';
  style.media = 'screen'
  container.appendChild(style)
  return style
}

export function createCSSRule(
  selector: string,
  cssText: string,
  style: HTMLStyleElement = getSharedStyleSheet(),
): void {
  if (!style || !cssText) return

  ;(<CSSStyleSheet>style.sheet).insertRule(selector + '{' + cssText + '}', 0)
}

/** 加载图片 */
export const loadImage = (src: string, img = new Image()) =>
  new Promise(
    (
      resolve: (el: HTMLImageElement) => void,
      reject: (reason?: string | Event) => void,
    ) => {
      img.onload = () => resolve(img)
      img.onerror = e => reject(e)
      img.src = src
    },
  )

/** 加载本地文件 */
export const loadLocalFile = (accept = 'image/png') =>
  new Promise((resolve: (file: File) => void, reject: () => void) => {
    const input = document.createElement('input')
    Object.assign(input, { accept, type: 'file' })
    input.onchange = () => {
      const file = input.files?.[0]
      file?.type.startsWith('image/') ? resolve(file) : reject()
    }
    input.click()
  })

export const loadLocalImage = (img = new Image()) =>
  loadLocalFile().then(file => loadImage(URL.createObjectURL(file), img))

export const loadScreenCaptureImage = (img = new Image()) =>
  getScreenCapture().then(file => loadImage(URL.createObjectURL(file), img))
