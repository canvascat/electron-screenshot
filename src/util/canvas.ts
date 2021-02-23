import { bound, brushColor, brushWidth, canvasRef, imageSource, mosaicOriginalPxData } from 'src/store'
import { ActionHistoryItem, Point } from 'src/type'

/** PI/6 */
const ARROW_ANGLE = Math.PI / 6

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  width: number,
  fillStyle: CanvasFillStrokeStyles['fillStyle'],
) {
  const [x1, y1] = startPoint
  const [x2, y2] = endPoint
  const alpha = Math.atan((y1 - y2) / (x1 - x2))
  const minArrowHeight = Math.abs(
    (x2 - x1) / (Math.cos(alpha) * Math.cos(ARROW_ANGLE)),
  )
  const arrowHeight = Math.min(minArrowHeight, 6 + width * 2)
  const d = x2 < x1 ? -1 : 1
  const [x3, y3] = [
    x2 - Math.cos(alpha - ARROW_ANGLE) * arrowHeight * d,
    y2 - Math.sin(alpha - ARROW_ANGLE) * arrowHeight * d,
  ]
  const [x4, y4] = [
    x2 - Math.cos(alpha + ARROW_ANGLE) * arrowHeight * d,
    y2 - Math.sin(alpha + ARROW_ANGLE) * arrowHeight * d,
  ]
  const [xa, ya] = [(x4 - x3) / 3, (y4 - y3) / 3]
  const [x5, y5] = [x3 + xa, y3 + ya]
  const [x6, y6] = [x4 - xa, y4 - ya]
  const paths: Array<Point> = [
    [x1, y1],
    [x5, y5],
    [x3, y3],
    [x2, y2],
    [x4, y4],
    [x6, y6],
  ]
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  paths.slice(1).forEach(point => ctx.lineTo(...point))
  ctx.closePath()
  ctx.fillStyle = fillStyle
  ctx.fill()
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  lineWidth: number,
  strokeStyle: CanvasFillStrokeStyles['strokeStyle'],
) {
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = strokeStyle
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(...startPoint)
  ctx.lineTo(...endPoint)
  ctx.stroke()
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  lineWidth: number,
  strokeStyle: CanvasFillStrokeStyles['strokeStyle'],
) {
  const [[x1, y1], [x2, y2]] = [startPoint, endPoint]
  const paths: Array<Point> = [startPoint, [x1, y2], endPoint, [x2, y1]]
  ctx.beginPath()
  ctx.moveTo(...startPoint)
  paths.slice(1).forEach(point => ctx.lineTo(...point))
  ctx.closePath()
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = strokeStyle
  ctx.stroke()
}

export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  lineWidth: number,
  strokeStyle: CanvasFillStrokeStyles['strokeStyle'],
) {
  const [[x1, y1], [x2, y2]] = [startPoint, endPoint]
  const [r1, r2] = [x1 - x2, y1 - y2].map(n => Math.abs(n / 2))
  const [x0, y0] = [(x1 + x2) / 2, (y1 + y2) / 2]
  const r = Math.max(r1, r2)
  const [rx, ry] = [r1 / r, r2 / r]
  ctx.save()
  ctx.scale(rx, ry)
  ctx.beginPath()
  ctx.arc(x0 / rx, y0 / ry, r, 0, 2 * Math.PI)
  ctx.closePath()
  ctx.restore()
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = strokeStyle
  ctx.stroke()
}

export function drawCurve(
  ctx: CanvasRenderingContext2D,
  path: Array<Point>,
  lineWidth: number,
  strokeStyle: CanvasFillStrokeStyles['strokeStyle'],
) {
  if (path.length < 2) return
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = strokeStyle
  ctx.lineCap = 'round'
  ctx.beginPath()
  let startPoint = path[0]
  ctx.moveTo(...startPoint)
  for (let i = 1; i < path.length - 1; i++) {
    /** controlPoint, nextPoint */
    const [[cx, cy], [nx, ny]] = path.slice(i, i + 2)
    /** endPoint */
    const [ex, ey] = [cx + (nx - cx) / 2, cy + (ny - cy) / 2]
    ctx.quadraticCurveTo(cx, cy, ex, ey)
    startPoint = [ex, ey]
  }
  ctx.lineTo(...path.slice(-1)[0])
  ctx.stroke()
  ctx.closePath()
}

export function createMosaicData(ctx: CanvasRenderingContext2D, size = 10) {
  const { width, height } = ctx.canvas
  const [wl, hl] = [Math.ceil(width / size), Math.ceil(height / size)]
  const data = ctx.getImageData(0, 0, width, height).data
  const md = new Uint8ClampedArray(wl * hl * 4)
  for (let i = 0; i < wl * hl; i++) {
    const sy = Math.floor(i / wl)
    const sx = i - sy * wl
    let [sumR, sumG, sumB, total] = [0, 0, 0, 0]
    for (let y = sy * size; y < Math.min((sy + 1) * size, height); y++) {
      const stratY = y * width
      for (let x = sx * size; x < Math.min((sx + 1) * size, width); x++) {
        const sIndex = (stratY + x) * 4
        sumR += data[sIndex], sumG += data[sIndex + 1], sumB += data[sIndex + 2], total++
      }
    }
    [md[i * 4], md[i * 4 + 1], md[i * 4 + 2], md[i * 4 + 3]] = [sumR / total, sumG / total, sumB / total, 255]
  }
  return md
}

/** 生成绘制马赛克区域的信息 */
const createDrawMosaicLayerData = (width: number, height: number, path: Array<Point>, r: number) =>
  path.reduce((data, [x0, y0]) => {
    const [startX, endX] = [Math.max(0, x0 - r), Math.min(x0 + r, width)]
    const [startY, endY] = [Math.max(0, y0 - r), Math.min(y0 + r, height)]
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if ((x - x0) ** 2 + (y - y0) ** 2 < r ** 2) {
          data[y * width + x] = true
        }
      }
    }
    return data
  }, <Array<boolean>>Array(width * height).fill(false))

export function drawMosaic(
  ctx: CanvasRenderingContext2D,
  path: Array<Point>,
  size = 10,
  brushWidth = 30,
  data: Uint8ClampedArray,
) {
  const { height, width } = ctx.canvas
  const drawData = createDrawMosaicLayerData(width, height, path, brushWidth / 2)
  const [wl, hl] = [Math.ceil(width / size), Math.ceil(height / size)]
  const originalData = ctx.getImageData(0, 0, width, height).data
  const newData = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < hl; y++) {
    const [startY, endY] = [y * size, Math.min((y + 1) * size, height)]
    for (let x = 0; x < wl; x++) {
      const [startX, endX] = [x * size, Math.min((x + 1) * size, width)]
      const index = (y * wl + x) * 4
      const [R, G, B, A] = [data[index], data[index + 1], data[index + 2], 255]
      for (let y0 = startY; y0 < endY; y0++) {
        for (let x0 = startX; x0 < endX; x0++) {
          const dIndex = y0 * width + x0
          const nIndex = dIndex * 4
          if (drawData[dIndex]) {
            newData[nIndex] = R
            newData[nIndex + 1] = G
            newData[nIndex + 2] = B
            newData[nIndex + 3] = A
          } else {
            newData[nIndex] = originalData[nIndex]
            newData[nIndex + 1] = originalData[nIndex + 1]
            newData[nIndex + 2] = originalData[nIndex + 2]
            newData[nIndex + 3] = originalData[nIndex + 3]
          }
        }
      }
    }
  }
  ctx.putImageData(new ImageData(newData, width, height), 0, 0)
}

export const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise((resolve: (file: Blob) => void, reject: (err: Error) => void) =>
    canvas.toBlob(file =>
      file ? resolve(file) : reject(new Error('Failed to convert file')),
    ),
  )

export function copyCanvas(
  image: CanvasImageSource,
  sx: number,
  sy: number,
  width: number,
  height: number,
) {
  const canvas = document.createElement('canvas')
  Object.assign(canvas, { height, width })
  const ctx = canvas.getContext('2d')
  ctx!.drawImage(image, sx, sy, width, height, 0, 0, width, height)
  return canvas
}

export function downloadCanvas(
  image: CanvasImageSource,
  sx: number,
  sy: number,
  width: number,
  height: number,
) {
  const canvas = copyCanvas(image, sx, sy, width, height)
  const url = canvas.toDataURL('image/png')
  canvasToBlob(canvas).then(console.log)
  const link = document.createElement('a')
  link.download = `导出图片${Date.now()}.png`
  link.href = url
  link.click()
}

export const writeCanvasToClipboard = (canvas: HTMLCanvasElement) =>
  navigator.permissions
    .query({ name: <PermissionName>'clipboard-write' })
    .then(async ({ state }) => {
      if (state !== 'granted')
        throw new Error('clipboard-permissoin not granted')
      return canvasToBlob(canvas).then(blob => {
        const { type } = blob
        // const name = `导出图片${Date.now()}.${type.split('/').slice(-1)[0]}`
        // const file = new File([blob], name, { type })
        // const data = new DataTransfer();
        // data.items.add(file)
        // return navigator.clipboard.write(data).then(() => 'success', () => 'failure')
        // https://stackoverflow.com/questions/58312058/navigator-clipboard-write-clipboard-iterator-getter-is-not-callable
        // https://stackoverflow.com/questions/57278923/chrome-76-copy-content-to-clipboard-using-navigator
        return navigator.clipboard.write([new ClipboardItem({ [type]: blob })])
      })
    })

export function updateCanvas(
  actionHistory: Array<ActionHistoryItem>,
  ctx: CanvasRenderingContext2D = canvasRef.value!.getContext('2d')!,
  image: CanvasImageSource = imageSource,
) {
  ctx.clearRect(0, 0, bound.x.max, bound.y.max)
  ctx.drawImage(image, 0, 0)
  actionHistory.forEach(item => {
    const width = item.attr?.width ?? brushWidth.value
    const color = item.attr?.color ?? brushColor.value
    switch (item.id) {
      case 'LINE': {
        const [startPoint, endPoint] = item.path!
        drawLine(ctx, startPoint, endPoint, width, color)
        break
      }
      case 'RECT': {
        const [startPoint, endPoint] = item.path!
        drawRect(ctx, startPoint, endPoint, width, color)
        break
      }
      case 'ARROW': {
        const [startPoint, endPoint] = item.path!
        drawArrow(ctx, startPoint, endPoint, width, color)
        break
      }
      case 'ELLIPSE': {
        const [startPoint, endPoint] = item.path!
        drawEllipse(ctx, startPoint, endPoint, width, color)
        break
      }
      // TODO: 当path.length较长，绘制会出现卡顿，使用snapshoot
      case 'BRUSH':
        drawCurve(ctx, item.path!, width, color)
        break
      case 'MOSAIC':
        drawMosaic(ctx, item.path!, 10, 30, mosaicOriginalPxData.value!)
        break
      default:
        break
    }
  })
}
