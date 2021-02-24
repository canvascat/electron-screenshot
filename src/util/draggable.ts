import { on, off } from 'src/util/dom'

let isDragging = false

export declare interface IOptions {
  drag?: (event: MouseEvent) => void
  start?: (event: MouseEvent) => void
  end?: (event: MouseEvent) => void
}

export default function (element: HTMLElement, options: IOptions) {
  const moveFn = function (event: MouseEvent) {
    options.drag?.(event)
  }

  const upFn = function (event: MouseEvent) {
    off(document, 'mousemove', moveFn)
    off(document, 'mouseup', upFn)
    document.onselectstart = null
    document.ondragstart = null

    isDragging = false

    options.end?.(event)
  }

  on(element, 'mousedown', function (event) {
    if (isDragging) return
    document.onselectstart = () => false
    document.ondragstart = () => false
    on(document, 'mousemove', moveFn)
    on(document, 'mouseup', upFn)

    isDragging = true

    options.start?.(event)
  })
}
