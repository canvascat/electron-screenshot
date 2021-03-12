import { isEmpty, range } from 'lodash'

type ColorArray = [number, number, number]
type HexArray = [string, string, string]
type FormatType = 'hex' | 'rgb' | 'hsl' | 'hsv'
type ColorUpdateData = {
  hue?: number
  saturation?: number
  value?: number
  alpha?: number
}


/** HSL hue色相/saturati/饱和度/lightness亮度 */
const hsv2hsl = (hue: number, sat = 100, val = 100) => [
  hue,
  (sat * val / ((hue = (2 - (sat /= 100)) * val) < 1 ? hue : 200 - hue)) | 0,
  hue >> 1,
]

export function hsvFormatHsl(hue: number, sat = 100, val = 100, alpha = 100) {
  const hsl = hsv2hsl(hue, sat, val)
  return `hsla(${ hue }, ${ hsl[1] | 0 }%, ${ hsl[2] | 0 }%, ${ alpha / 100})`
}

export function hsvFormatHsv(hue: number, sat = 100, val = 100, alpha = 100) {
  return `hsva(${ hue }, ${ sat | 0 }%, ${ val | 0 }%, ${ alpha / 100})`
}

export function hsvFormatRgb (hue: number, sat = 100, val = 100, alpha = 100) {
  const [r, g, b] = hsv2rgb(hue, sat, val)
  return `rgba(${r}, ${g}, ${b}, ${ alpha / 100 })`
}

export function hsvFormatHex(hue: number, sat = 100, val = 100, alpha?: number) {
  const [h, e, x] = hsv2hex(hue, sat, val)
  const a = typeof alpha === 'number' ? (alpha * 255 / 100 | 0).toString(16).padStart(2, '0') : ''
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

const rgb2hex = (r: number, g: number, b: number) => <HexArray>([r, g, b]).map(v => v.toString(16).padStart(2, '0'))

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
 * @return *Returns:* [h, s, v] in [0,1]
 */
export function rgb2hsv(r: number, g: number, b: number): ColorArray {
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

  return [h * 360, s * 100, v * 100]
}

/**
 * Converts an HSV color value to RGB.
 * @arguments *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
 * @return *Returns:* [r, g, b] in the set [0, 255]
 */
export function hsv2rgb(h: number, s: number, v: number): ColorArray {
  h = bound01(h, 360) * 6
  s = bound01(s, 100)
  v = bound01(v, 100)

  const i = h | 0
  const f = h - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const mod = i % 6
  const r = [v, q, p, p, t, v][mod]
  const g = [t, v, v, q, p, p][mod]
  const b = [p, p, t, v, v, q][mod]

  return [r * 255 | 0, g * 255 | 0, b * 255 | 0]
}

/**
 * Converts an HSV color value to HEX.
 * @arguments *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
 * @return *Returns:* [h, e, x] in the set [0, ff]
 */
export function hsv2hex(h: number, s: number, v: number) {
  return hsv2rgb(h, s, v).map(value => Math.min(value | 0, 255).toString(16).padStart(2, '0'))
}

export interface Options {
  enableAlpha?: boolean
  format?: string
  color?: string
}

export default class Color {
  // hsva 修改后需要调用update
  hue = 0 // [0, 360]
  saturation = 100 // [0, 100]
  value = 100 // [0, 100]
  alpha = 100 // [0, 100]

  /** 是否支持透明色 */
  public enableAlpha = false
  /** color 格式 */
  public format: FormatType = 'hex'
  /** 格式化后的颜色 */
  public color = ''

  constructor(options?: Options) {

    !isEmpty(options) && Object.assign(this, options)

    this.update()
  }

  toRgb() {
    return hsv2rgb(this.hue, this.saturation, this.value)
  }

  fromString(val: string) {
    if (!val) {
      this.update({ hue: 0, saturation: 100, value: 100 })
      return
    }

    const fromHSV = (h: number, s: number, v: number) => this.update({
      hue: Math.max(0, Math.min(360, h)),
      saturation: Math.max(0, Math.min(100, s)),
      value: Math.max(0, Math.min(100, v)),
    })

    if (val.indexOf('hsl') !== -1) {
      const parts = val.replace(/hsla|hsl|\(|\)/gm, '')
        .split(/\s|,/g).filter(val => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10))

      if (parts.length === 4) {
        this.alpha = parseFloat('' + parts[3]) * 100 | 0
      } else if (parts.length === 3) {
        this.alpha = 100
      }
      if (parts.length >= 3) {
        const { h, s, v } = hsl2hsv(parts[0], parts[1], parts[2])
        fromHSV(h, s, v)
      }
    } else if (val.indexOf('hsv') !== -1) {
      const parts = val.replace(/hsva|hsv|\(|\)/gm, '')
        .split(/\s|,/g).filter(val => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10))

      if (parts.length === 4) {
        this.alpha = parseFloat('' + parts[3]) * 100 | 0
      } else if (parts.length === 3) {
        this.alpha = 100
      }
      if (parts.length >= 3) {
        fromHSV(parts[0], parts[1], parts[2])
      }
    } else if (val.indexOf('rgb') !== -1) {
      const parts = val.replace(/rgba|rgb|\(|\)/gm, '')
        .split(/\s|,/g).filter(v => v !== '').map((v, index) => index > 2 ? parseFloat(v) : parseInt(v, 10))

      if (parts.length === 4) {
        this.alpha = parseFloat(parts[3].toString()) * 100 | 0
      } else if (parts.length === 3) {
        this.alpha = 100
      }
      if (parts.length >= 3) {
        fromHSV(...rgb2hsv(parts[0], parts[1], parts[2]))
      }
    } else if (val.indexOf('#') !== -1) {
      const hex = val.replace('#', '').trim()
      if (!/^[0-9a-fA-F]*$/.test(hex)) return
      const len = hex.length
      if (![3, 4, 6, 8].includes(len)) return
      const pad = (v: string) => v.length === 1 ? v + v : v
      const parseHexChannel = (v: string) => parseInt(pad(v), 16)
      const channelLen = len === 3 || len === 4 ? 1 : 2
      const [r, g, b, a] = range(len / channelLen).map(i => parseHexChannel(hex.substr(i * channelLen, channelLen)))
      this.alpha = (a ?? 255) / 255 * 100 | 0
      fromHSV(...rgb2hsv(r, g, b))
    }
  }

  compare(color: Color) {
    return Math.abs(color.hue - this.hue) < 2 &&
      Math.abs(color.saturation - this.saturation) < 1 &&
      Math.abs(color.value - this.value) < 1 &&
      Math.abs(color.alpha - this.alpha) < 1
  }

  update(data?: ColorUpdateData) {
    data && Object.assign(this, data)
    const { hue, saturation, value, alpha, format } = this

    if (this.enableAlpha) {
      switch (format) {
        case 'hsl': {
          const hsl = hsv2hsl(hue, saturation, value)
          this.color = `hsla(${ hue }, ${ hsl[1] | 0 }%, ${ hsl[2] | 0 }%, ${ alpha / 100})`
          break
        }
        case 'hsv': {
          this.color = `hsva(${ hue }, ${ saturation | 0 }%, ${ value | 0 }%, ${ alpha / 100})`
          break
        }
        default: {
          const [r, g, b] = hsv2rgb(hue, saturation, value)
          this.color = `rgba(${r}, ${g}, ${b}, ${ alpha / 100 })`
        }
      }
    } else {
      switch (format) {
        case 'hsl': {
          const hsl = hsv2hsl(hue, saturation, value)
          this.color = `hsl(${ hue }, ${ hsl[1] | 0 }%, ${ hsl[2] | 0 }%)`
          break
        }
        case 'hsv': {
          this.color = `hsv(${ hue }, ${ saturation | 0 }%, ${ value | 0 }%)`
          break
        }
        case 'rgb':{
          const [r, g, b] = hsv2rgb(hue, saturation, value)
          this.color = `rgb(${r}, ${g}, ${b})`
          break
        }
        default: {
          this.color = '#' + rgb2hex(...hsv2rgb(hue, saturation, value)).join('')
        }
      }
    }

    return this.color
  }
}
