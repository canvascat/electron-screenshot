export const sleep = (t = 0) => new Promise((resolve) => setTimeout(resolve, t))

export type AnyFunction<T> = (...args: any[]) => T
export function rafThrottle<T extends AnyFunction<any>>(
  fn: T,
): AnyFunction<void> {
  let locked = false
  return function (...args: any[]) {
    if (locked) return
    locked = true
    window.requestAnimationFrame(() => {
      fn.apply(this, args)
      locked = false
    })
  }
}
