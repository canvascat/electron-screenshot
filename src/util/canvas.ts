import { findLast, isEqual } from 'lodash'
import { bound, canvasRef, imageSource, mosaicOriginalPxData } from 'src/store'
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
  path.slice(1).forEach(point => ctx.lineTo(...point))
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

function normalizePath(path: Array<Point>, size: number, brushWidth: number) {
  const offSet = brushWidth - ~~(brushWidth / size / 2) * size * 2
  return path.reduce((np, [x0, y0]) => {
    x0 = +Math.round((x0 - offSet) / size / 2) * size * 2
    y0 = +Math.round((y0 - offSet) / size / 2) * size * 2
    const normalizePoint: Point = [x0, y0]
    if (!findLast(np, p => isEqual(p, normalizePoint))) np.push(normalizePoint)
    return np
  }, <Array<Point>>[])
}

/**
 * 绘制马赛克
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<Point>} path 笔触路径
 * @param {number} [size=6] 马赛克大小
 * @param {number} [brushWidth=30] 画笔宽度
 */
export function drawMosaic(
  ctx: CanvasRenderingContext2D,
  path: Array<Point>,
  size = 6,
  brushWidth = 30,
  data = mosaicOriginalPxData.value!,
) {
  const { height, width } = ctx.canvas
  /** 原始图片像素数据 */
  // data ??= ctx.getImageData(0, 0, width, height).data
  /** 拷贝一份数据用来修改 */
  const modifyImgData = ctx.getImageData(0, 0, width, height)
  const modifyPxData = modifyImgData.data
  const num = ~~(brushWidth / size / 2)
  const offSet = brushWidth - num * size * 2
  normalizePath(path, size, brushWidth).forEach(([x0, y0]) => {
    for (
      let x1 = x0 - size * num, maxX1 = x0 + size * num + offSet;
      x1 < maxX1;
      x1 += 2 * size
    ) {
      for (
        let y1 = y0 - size * num, maxY1 = y0 + size * num + offSet;
        y1 < maxY1;
        y1 += 2 * size
      ) {
        // (x1, y1) 为每个像素点的基准坐标
        // 计算出已 (x1, y1) 为基准坐标的马赛克块内的平均 RGB 值
        let [sumR, sumG, sumB] = [0, 0, 0]
        const pixelIndexList = []
        for (let x = x1, maxX = x1 + 2 * size; x < maxX; x++) {
          for (let y = y1, maxY = y1 + 2 * size; y < maxY; y++) {
            const pixelIndex = (y * width + x) * 4
            // 圆形边界判断条件，可以让笔触边缘为圆角，之后只给圆内的像素点调整颜色
            if (
              (y - y0 + offSet / 2) ** 2 + (x - x0 + offSet / 2) ** 2 <=
              (brushWidth / 2) ** 2
            ) {
              pixelIndexList.push(pixelIndex)
            }
            sumR += data[pixelIndex]
            sumG += data[pixelIndex + 1]
            sumB += data[pixelIndex + 2]
          }
        }
        const pixelTotlal = (2 * size) ** 2 // pixelIndexList.length // 单个马赛克的像素点数量
        const [avgR, avgG, avgB] = [
          sumR / pixelTotlal,
          sumG / pixelTotlal,
          sumB / pixelTotlal,
        ]

        for (let x = 0; x < pixelIndexList.length; x++) {
          const pixelIndex = pixelIndexList[x]
          modifyPxData[pixelIndex] = avgR
          modifyPxData[pixelIndex + 1] = avgG
          modifyPxData[pixelIndex + 2] = avgB
        }
      }
    }
  })
  ctx.putImageData(modifyImgData, 0, 0, 0, 0, width, height)
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
    switch (item.id) {
      case 'LINE': {
        const [startPoint, endPoint] = item.path!
        drawLine(ctx, startPoint, endPoint, 1, 'red')
        break
      }
      case 'RECT': {
        const [startPoint, endPoint] = item.path!
        drawRect(ctx, startPoint, endPoint, 1, 'red')
        break
      }
      case 'ARROW': {
        const [startPoint, endPoint] = item.path!
        drawArrow(ctx, startPoint, endPoint, 4, 'red')
        break
      }
      case 'ELLIPSE': {
        const [startPoint, endPoint] = item.path!
        drawEllipse(ctx, startPoint, endPoint, 1, 'red')
        break
      }
      case 'BRUSH':
        // TODO 当path.length较长，绘制会出现卡顿，使用snapshoot
        drawCurve(ctx, item.path!, 4, 'red')
        break
      case 'MOSAIC':
        drawMosaic(ctx, item.path!)
        break
      default:
        break
    }
  })
}
