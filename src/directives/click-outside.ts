import { on } from 'src/util/dom'
import type { ComponentPublicInstance, DirectiveBinding, ObjectDirective } from 'vue'

type DocumentHandler = <T extends MouseEvent>(mouseup: T, mousedown: T) => void;

type FlushListItem = {
  documentHandler: DocumentHandler
  bindingFn: (...args: unknown[]) => unknown
  type?: 'down' | 'up'
}

type FlushList = Map<HTMLElement, FlushListItem>;

const nodeList: FlushList = new Map()

let startClick: MouseEvent | undefined

on(document, 'mousedown', (e: MouseEvent) => {
  startClick = e
  for (const { documentHandler, type } of nodeList.values()) {
    type === 'down' && documentHandler(e, startClick)
  }
})
on(document, 'mouseup', (e: MouseEvent) => {
  for (const { documentHandler, type } of nodeList.values()) {
    type !== 'down' && documentHandler(e, startClick!)
  }
  startClick = undefined
})

function createDocumentHandler(
  el: HTMLElement,
  binding: DirectiveBinding,
): DocumentHandler {
  return function(mouseup, mousedown) {
    const popperRef = (binding.instance as ComponentPublicInstance<{
      popperRef?: HTMLElement
    }>).popperRef
    const mouseUpTarget = mouseup.target as Node
    const mouseDownTarget = mousedown.target as Node
    const isBound = !binding || !binding.instance
    const isTargetExists = !mouseUpTarget || !mouseDownTarget
    const isContainedByEl = el.contains(mouseUpTarget) || el.contains(mouseDownTarget)
    const isSelf = el === mouseUpTarget

    const isContainedByPopper = (
      popperRef &&
      (
        popperRef.contains(mouseUpTarget) ||
          popperRef.contains(mouseDownTarget)
      )
    )
    if (
      isBound ||
      isTargetExists ||
      isContainedByEl ||
      isSelf ||
      isContainedByPopper
    ) {
      return
    }
    binding.value()
  }
}

function createFlushListItem (el: HTMLElement, binding: DirectiveBinding<any>) {
  return <FlushListItem>{
    documentHandler: createDocumentHandler(el, binding),
    bindingFn: binding.value,
    type: binding.arg ?? 'up',
  }
}

const ClickOutside: ObjectDirective<HTMLElement> = {
  beforeMount(el, binding) {
    nodeList.set(el, createFlushListItem(el, binding))
  },
  updated(el, binding) {
    nodeList.set(el, createFlushListItem(el, binding))
  },
  unmounted(el) {
    nodeList.delete(el)
  },
}

export default ClickOutside
