const saturation = 100
const value = 100
const hsv2hsl = (hue: number, sat = 1, val = 1) => [
  hue,
  (sat * val / ((hue = (2 - sat) * val) < 1 ? hue : 2 - hue)) || 0,
  hue / 2,
]

export function hsvFormatHsl(hue: number, sat = saturation, val = value, alpha = 100) {
  const hsl = hsv2hsl(hue, sat / 100, val / 100)
  return `hsla(${ hue }, ${ Math.round(hsl[1] * 100) }%, ${ Math.round(hsl[2] * 100) }%, ${ alpha / 100})`
}

export function hsvFormatHsv(hue: number, sat = saturation, val = value, alpha = 100) {
  return `hsva(${ hue }, ${ Math.round(sat) }%, ${ Math.round(val) }%, ${ alpha / 100})`
}

export function hsvFormatRgb (hue: number, sat = saturation, val = value, alpha = 100) {
  const [r, g, b] = hsv2rgb(hue, sat, val)
  return `rgba(${r}, ${g}, ${b}, ${ alpha / 100 })`
}

export function hsvFormatHex(hue: number, sat = saturation, val = value, alpha?: number) {
  const [h, e, x] = hsv2hex(hue, sat, val)
  const a = alpha ? Math.round(alpha * 255 / 100).toString(16).padStart(2, '0') : ''
  return `#${h}${e}${x}${a}`
}

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
const isOnePointZero = (n: unknown) => typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1

const isPercentage = (n: unknown) => typeof n === 'string' && n.indexOf('%') !== -1

// Take input from [0, n] and return it as [0, 1]
const bound01 = function(value: number | string, max: number | string) {
  if (isOnePointZero(value)) value = '100%'

  const processPercent = isPercentage(value)
  value = Math.min((max as number), Math.max(0, parseFloat(value + '')))

  // Automatically convert percentage into number
  if (processPercent) {
    value = parseInt((value * (max as number)) + '', 10) / 100
  }

  // Handle floating point rounding errors
  if ((Math.abs(value - (max as number)) < 0.000001)) {
    return 1
  }

  // Convert into [0, 1] range if it isn't already
  return (value % (max as number)) / parseFloat(max as string)
}

/**
 * Converts an HSL color value to HSV
 * @arguments *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
 * @return *Returns:* { h, s, v } in [0,1]
 */
export function hsl2hsv (hue: number, sat: number, light: number) {
  sat = sat / 100
  light = light / 100
  let smin = sat
  const lmin = Math.max(light, 0.01)

  light *= 2
  sat *= (light <= 1) ? light : 2 - light
  smin *= lmin <= 1 ? lmin : 2 - lmin
  const v = (light + sat) / 2
  const sv = light === 0 ? (2 * smin) / (lmin + smin) : (2 * sat) / (light + sat)

  return {
    h: hue,
    s: sv * 100,
    v: v * 100,
  }
}

/**
 * Converts an RGB color value to HSV
 * @arguments *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
 * @return *Returns:* { h, s, v } in [0,1]
 */
export function rgb2hsv(r: number, g: number, b: number) {
  r = bound01(r, 255)
  g = bound01(g, 255)
  b = bound01(b, 255)

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0 // ??
  const v = max

  const d = max - min
  const s = max === 0 ? 0 : d / max

  if (max === min) {
    h = 0 // achromatic
  } else {
    switch (max) {
      case r: {
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      }
      case g: {
        h = (b - r) / d + 2
        break
      }
      case b: {
        h = (r - g) / d + 4
        break
      }
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, v: v * 100 }
}

/**
 * Converts an HSV color value to RGB.
 * @arguments *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
 * @return *Returns:* [r, g, b] in the set [0, 255]
 */
export function hsv2rgb(h: number, s: number, v: number) {
  h = bound01(h, 360) * 6
  s = bound01(s, 100)
  v = bound01(v, 100)

  const i = Math.floor(h)
  const f = h - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const mod = i % 6
  const r = [v, q, p, p, t, v][mod]
  const g = [t, v, v, q, p, p][mod]
  const b = [p, p, t, v, v, q][mod]

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

/**
 * Converts an HSV color value to HEX.
 * @arguments *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
 * @return *Returns:* [h, e, x] in the set [0, ff]
 */
export function hsv2hex(h: number, s: number, v: number) {
  return hsv2rgb(h, s, v).map(value => Math.min(Math.round(value), 255).toString(16).padStart(2, '0'))
}
