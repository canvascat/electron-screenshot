import { throttle } from 'lodash';
import { on, off } from 'src/util/dom';

let isDragging = false;

type MouseEventLister = (event: MouseEvent) => void;
export declare interface IOptions {
  drag?: MouseEventLister;
  start?: MouseEventLister;
  end?: MouseEventLister;
  all?: MouseEventLister;
}

export function draggable(element: HTMLElement, lister: MouseEventLister): void;
export function draggable(element: HTMLElement, options: IOptions): void;
export function draggable(
  element: HTMLElement,
  all: IOptions | MouseEventLister
) {
  const options = typeof all === 'function' ? { all } : all;
  const moveFn = throttle(function (event: MouseEvent) {
    (options.drag ?? options.all)?.(event);
  });

  const upFn = function (event: MouseEvent) {
    off(document, 'mousemove', moveFn);
    off(document, 'mouseup', upFn);
    document.onselectstart = null;
    document.ondragstart = null;

    isDragging = false;
    (options.end ?? options.all)?.(event);
  };

  on(element, 'mousedown', function (event) {
    if (isDragging) return;

    document.onselectstart = () => false;
    document.ondragstart = () => false;
    on(document, 'mousemove', moveFn);
    on(document, 'mouseup', upFn);

    isDragging = true;
    (options.start ?? options.all)?.(event);
  });
}
