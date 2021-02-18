import { isEqual } from 'lodash'
import { Point } from 'src/type'

export interface MosaicOptions {
  mosaicSize?: number
  brushWidth?: number
}

export default class Mosaic {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  originalImgData: Nullable<ImageData> = null
  downPoint: Nullable<Point> = null
  points: Array<Point> = []
  ops = []
  inited = false
  // mosaicCount = 4
  mosaicSize = 3
  private _brushWidth = 40 // 笔刷宽度

  constructor(canvas: HTMLCanvasElement, options: MosaicOptions = {}) {
    this.canvas = canvas
    Object.assign(this, options)
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#the_value_of_this_within_the_handler
    this.mouseDownHandler = this.mouseDownHandler.bind(this)
    this.documentMouseMoveHandle = this.documentMouseMoveHandle.bind(this)
    this.documentMouseUpHandle = this.documentMouseUpHandle.bind(this)
    canvas.addEventListener('mousedown', this.mouseDownHandler)
  }

  async init(file: Blob) {
    await drawImageToCanvas(this.canvas, file)
    const { width, height } = this.canvas
    this.originalImgData = this.ctx.getImageData(0, 0, width, height)
    this.inited = true
  }

  set brushWidth(w: number) {
    /* URL和xy的坐标偏移值，最后提供一个关键字值作为备用 */
    // cursor:  url(cursor1.png) 4 12, auto;
    // cursor:  url(cursor2.png) 2 2, pointer;
    const r = w / 2
    const cursor = encodeURIComponent(`<svg width="${w}" height="${w}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${r}" cy="${r}" r="${
      r - 1
    }" stroke="red" stroke-width="1" fill="none"/>
      </svg>`)
    console.log(w, `url(data:image/svg+xml;utf8,${cursor}) ${r} ${r}, auto;`)
    this.canvas.style.cursor = `url(data:image/svg+xml;utf8, ${cursor}) ${r} ${r}, auto`
    this._brushWidth = w
  }

  get brushWidth() {
    return this._brushWidth
  }

  destroy() {
    this.canvas.onmousedown = null
    this.canvas.removeEventListener('mousedown', this.mouseDownHandler)
  }

  mouseDownHandler(e: MouseEvent) {
    e.stopImmediatePropagation()
    document.onselectstart = () => false
    const { pageX, pageY } = e
    const { offsetLeft, offsetTop } = this.canvas
    const { scrollLeft, scrollTop } = this.canvas.parentElement as HTMLElement
    console.log(pageX, offsetLeft, scrollLeft, pageY, offsetTop, scrollTop)
    this.downPoint = [
      pageX - offsetLeft + scrollLeft,
      pageY - offsetTop + scrollTop,
    ]
    console.log(this.downPoint)
    this.points = []
    document.addEventListener('mousemove', this.documentMouseMoveHandle)
    document.addEventListener('mouseup', this.documentMouseUpHandle)
  }

  documentMouseMoveHandle(e: MouseEvent) {
    if (!this.downPoint) return
    e.stopImmediatePropagation()
    const { pageX, pageY } = e
    const { offsetLeft, offsetTop } = this.canvas
    const { scrollLeft, scrollTop } = this.canvas.parentElement as HTMLElement
    const point: Point = [
      pageX - offsetLeft + scrollLeft,
      pageY - offsetTop + scrollTop,
    ]
    this.dealMosaicXY(point)
  }
  documentMouseUpHandle() {
    this.downPoint = null
    document.removeEventListener('mousemove', this.documentMouseMoveHandle)
    document.removeEventListener('mouseup', this.documentMouseUpHandle)
    document.onselectstart = null
    // this.ops.push({
    //   action: 'mosaic',
    //   attribute: {
    //     size: this.mosaicSize,
    //     num: this.mosaicCount,
    //     brushWidth: this.brushWidth
    //   },
    //   path: this.points
    // })
    console.log(this.points)
    this.points = []
  }
  dealMosaicXY(point: Point) {
    const offSet =
      this.brushWidth -
      ~~(this.brushWidth / this.mosaicSize / 2) * this.mosaicSize * 2
    let [x0, y0] = point
    // 将坐标偏移到最近的网格上
    x0 = +Math.round((x0 - offSet) / this.mosaicSize / 2) * this.mosaicSize * 2
    y0 = +Math.round((y0 - offSet) / this.mosaicSize / 2) * this.mosaicSize * 2
    point = [x0, y0]
    // 记录像素轨迹
    const [lastPoint] = this.points.slice(-1)
    if (
      isEqual(lastPoint, point) ||
      this.points.find((xy) => isEqual(xy, point))
    )
      return
    this.points.push(point)
    this.drawMosaic(point)
  }
  // 马赛克方格宽 2*MOSAIC_SIZE
  drawMosaic(point: Point) {
    const { mosaicSize: size, brushWidth } = this
    const num = ~~(brushWidth / size / 2)
    const offSet = brushWidth - num * size * 2
    // canvas 宽高
    const { width, height } = this.canvas
    // 源文件像素数据
    const originalPxData = (this.originalImgData as ImageData).data

    // 复制一份进行计算
    const modifyImgData = this.ctx.getImageData(0, 0, width, height)
    let modifyPxData = modifyImgData.data
    const [x0, y0] = point
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
        let pixelIndexList = []
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
            sumR += originalPxData[pixelIndex]
            sumG += originalPxData[pixelIndex + 1]
            sumB += originalPxData[pixelIndex + 2]
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
    this.ctx.putImageData(modifyImgData, 0, 0, 0, 0, width, height)
  }
}

export const loadLocalImage = () =>
  new Promise((resolve: (file: File) => void, reject: () => void) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const { files } = input
      if (!files || files.length <= 0) reject()
      const file = Array.from(files as FileList)[0]
      file.type.startsWith('image/') ? resolve(file) : reject()
    }
    input.click()
  })

interface DrawImageOptions {
  width?: number
  height?: number
}

// 图片平铺不缩放
export const drawImageToCanvas = (
  canvas: Nullable<HTMLCanvasElement>,
  file: Blob,
  options: DrawImageOptions = {},
) =>
  new Promise((resolve: (canvas: HTMLCanvasElement) => void, reject) => {
    if (!canvas) return reject()
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const { naturalWidth: dWidth, naturalHeight: dHeight } = img
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      const [width, height] = [
        options?.width ?? dWidth,
        options?.height ?? dHeight,
      ]
      Object.assign(canvas, { width, height })
      for (let i = 0; i < Math.ceil(height / dHeight); i++) {
        for (let j = 0; j < Math.ceil(width / dWidth); j++) {
          const [dx, dy] = [j * dWidth, i * dHeight]
          const [sWidth, sHeight] = [
            Math.min(width - dx, dWidth),
            Math.min(height - dy, dHeight),
          ]
          ctx.drawImage(img, 0, 0, sWidth, sHeight, dx, dy, sWidth, sHeight)
        }
      }
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    img.onerror = (event) => {
      reject(event)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })

export const drawCanvas = (
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
) => {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const { naturalWidth: dWidth, naturalHeight: dHeight } = img
  const [width, height] = [dWidth, dHeight]
  Object.assign(canvas, { width, height })
  for (let i = 0; i < Math.ceil(height / dHeight); i++) {
    for (let j = 0; j < Math.ceil(width / dWidth); j++) {
      const [dx, dy] = [j * dWidth, i * dHeight]
      ctx.drawImage(img, dx, dy)
    }
  }
}

export const download = (canvas: HTMLCanvasElement) => {
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `导出图片${Date.now()}.png`
  link.href = url
  link.click()
}
// export const download = (canvas: HTMLCanvasElement) => new Promise((resolve, reject) => {
//   canvas.toBlob((blob) => {
//     if (!blob) return reject();
//     const url = URL.createObjectURL(blob)
//     const link = document.createElement('a')
//     link.href = url
//     link.click()
//     URL.revokeObjectURL(url)
//     resolve(true)
//   })
// })
