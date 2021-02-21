import type { Point } from 'src/type'

export const sleep = (t = 0) => new Promise(resolve => setTimeout(resolve, t))

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

export function pointDistance([x0, y0]: Point, [x1, y1]: Point) {
  return ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5
}

export async function createNotification(options?: NotificationOptions, title = document.title): Promise<Notification> {
  if (!('Notification' in window)) throw new Error('This browser does not support notification')
  if (Notification.permission === 'granted') {
    options!.icon ||= document.querySelector('link[rel*=icon]')?.getAttribute('href') ?? undefined
    return new Notification(title, options)
  }
  if (Notification.permission === 'denied') throw new Error('notification permission denied')
  await Notification.requestPermission()
  return await createNotification(options, title)
}
