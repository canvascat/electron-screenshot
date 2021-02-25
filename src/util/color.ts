import { hasOwn } from './util'

type ColorArray = [number, number, number]
type HexArray = [string, string, string]
type FormatType = 'hex' | 'rgb' | 'hsl' | 'hsv'


/** HSL hue色相/saturati/饱和度/lightness亮度 */
const hsv2hsl = (hue: number, sat = 100, val = 100) => [
  hue,
  Math.round((sat * val / ((hue = (2 - (sat /= 100)) * val) < 1 ? hue : 200 - hue)) || 0),
  Math.round((hue / 2)),
]

export function hsvFormatHsl(hue: number, sat = 100, val = 100, alpha = 100) {
  const hsl = hsv2hsl(hue, sat / 100, val / 100)
  return `hsla(${ hue }, ${ Math.round(hsl[1]) }%, ${ Math.round(hsl[2]) }%, ${ alpha / 100})`
}

export function hsvFormatHsv(hue: number, sat = 100, val = 100, alpha = 100) {
  return `hsva(${ hue }, ${ Math.round(sat) }%, ${ Math.round(val) }%, ${ alpha / 100})`
}

export function hsvFormatRgb (hue: number, sat = 100, val = 100, alpha = 100) {
  const [r, g, b] = hsv2rgb(hue, sat, val)
  return `rgba(${r}, ${g}, ${b}, ${ alpha / 100 })`
}

export function hsvFormatHex(hue: number, sat = 100, val = 100, alpha?: number) {
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

const rgb2hex = (r: number, g: number, b: number) => <HexArray>([r, g, b]).map(v => v.toString(16))

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

export interface Options {
  enableAlpha: boolean
  format: string
  value?: string
}

type ColorPrivateProps = '_hue' | '_saturation' | '_value' | '_alpha'

export default class Color {
  // hsva
  private _hue = 0
  private _saturation = 100
  private _value = 100
  private _alpha = 100
  public enableAlpha = false

  public format: FormatType = 'hex'
  public value = ''
  constructor(options?: Options, value?: string) {

    options = options || {} as Options

    for (const option in options) {
      hasOwn(options, option) && Object.assign(this, { option })
    }

    this.doOnChange()
    value && this.fromString(value)
  }

  set(prop: {[key: string]: any;} | any, value?: number) {
    if (arguments.length === 1 && typeof prop === 'object') {
      for (const p in prop) {
        if (prop.hasOwnProperty(p)) {
          this.set(p, prop[p])
        }
      }

      return
    }
    if (!value) return
    prop = `_${prop}`
    this[<ColorPrivateProps>prop] = value
    this.doOnChange()
  }

  get(prop: string) {
    prop = `_${prop}`
    return this[<ColorPrivateProps>prop]
  }

  toRgb() {
    return hsv2rgb(this._hue, this._saturation, this._value)
  }

  fromString(value: string) {
    if (!value) {
      this._hue = 0
      this._saturation = 100
      this._value = 100

      this.doOnChange()
      return
    }

    const fromHSV = (h: number, s: number, v: number) => {
      this._hue = Math.max(0, Math.min(360, h))
      this._saturation = Math.max(0, Math.min(100, s))
      this._value = Math.max(0, Math.min(100, v))

      this.doOnChange()
    }

    if (value.indexOf('hsl') !== -1) {
      const parts = value.replace(/hsla|hsl|\(|\)/gm, '')
        .split(/\s|,/g).filter(val => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10))

      if (parts.length === 4) {
        this._alpha = Math.floor(parseFloat('' + parts[3]) * 100)
      } else if (parts.length === 3) {
        this._alpha = 100
      }
      if (parts.length >= 3) {
        const { h, s, v } = hsl2hsv(parts[0], parts[1], parts[2])
        fromHSV(h, s, v)
      }
    } else if (value.indexOf('hsv') !== -1) {
      const parts = value.replace(/hsva|hsv|\(|\)/gm, '')
        .split(/\s|,/g).filter(val => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10))

      if (parts.length === 4) {
        this._alpha = Math.floor(parseFloat('' + parts[3]) * 100)
      } else if (parts.length === 3) {
        this._alpha = 100
      }
      if (parts.length >= 3) {
        fromHSV(parts[0], parts[1], parts[2])
      }
    } else if (value.indexOf('rgb') !== -1) {
      const parts = value.replace(/rgba|rgb|\(|\)/gm, '')
        .split(/\s|,/g).filter(val => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10))

      if (parts.length === 4) {
        this._alpha = Math.floor(parseFloat(parts[3].toString()) * 100)
      } else if (parts.length === 3) {
        this._alpha = 100
      }
      if (parts.length >= 3) {
        fromHSV(...rgb2hsv(parts[0], parts[1], parts[2]))
      }
    } else if (value.indexOf('#') !== -1) {
      const hex = value.replace('#', '').trim()
      if (!/^[0-9a-fA-F]$/.test(hex)) return
      const len = hex.length
      if (![3, 4, 6, 8].includes(len)) return
      const pad = (v: string) => v.length === 1 ? v + v : v
      const parseHexChannel = (v: string) => parseInt(pad(v), 16)
      const channelLen = len === 3 || len === 4 ? 1 : 2
      const rgba = Array(len / channelLen).map((_, i) => parseHexChannel(hex.substr(i * channelLen, channelLen)))

      this._alpha = rgba.length === 4 ? Math.floor(rgba[3] / 255 * 100) : 100
      fromHSV(...rgb2hsv(rgba[0], rgba[1], rgba[2]))
    }
  }

  compare(color: Color) {
    return Math.abs(color._hue - this._hue) < 2 &&
      Math.abs(color._saturation - this._saturation) < 1 &&
      Math.abs(color._value - this._value) < 1 &&
      Math.abs(color._alpha - this._alpha) < 1
  }

  doOnChange() {
    const { _hue, _saturation, _value, _alpha, format } = this

    if (this.enableAlpha) {
      switch (format) {
        case 'hsl': {
          const hsl = hsv2hsl(_hue, _saturation, _value)
          this.value = `hsla(${ _hue }, ${ Math.round(hsl[1]) }%, ${ Math.round(hsl[2]) }%, ${ _alpha / 100})`
          break
        }
        case 'hsv': {
          this.value = `hsva(${ _hue }, ${ Math.round(_saturation) }%, ${ Math.round(_value) }%, ${ _alpha / 100})`
          break
        }
        default: {
          const [r, g, b] = hsv2rgb(_hue, _saturation, _value)
          this.value = `rgba(${r}, ${g}, ${b}, ${ _alpha / 100 })`
        }
      }
    } else {
      switch (format) {
        case 'hsl': {
          const hsl = hsv2hsl(_hue, _saturation, _value)
          this.value = `hsl(${ _hue }, ${ Math.round(hsl[1]) }%, ${ Math.round(hsl[2]) }%)`
          break
        }
        case 'hsv': {
          this.value = `hsv(${ _hue }, ${ Math.round(_saturation) }%, ${ Math.round(_value) }%)`
          break
        }
        case 'rgb':{
          const [r, g, b] = hsv2rgb(_hue, _saturation, _value)
          this.value = `rgb(${r}, ${g}, ${b})`
          break
        }
        default: {
          this.value = '#' + rgb2hex(...hsv2rgb(_hue, _saturation, _value)).join('')
        }
      }
    }
  }
}
