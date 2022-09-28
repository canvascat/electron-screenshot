import type { Point } from '@/type';
import { createDrawMosaicLayerData, createMosaicData } from './mosaic';
/** PI/6 */
const ARROW_ANGLE = Math.PI / 6;

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  width: number,
  fillStyle: CanvasFillStrokeStyles['fillStyle']
) {
  const [x1, y1] = startPoint;
  const [x2, y2] = endPoint;
  const alpha = Math.atan((y1 - y2) / (x1 - x2));
  const minArrowHeight = Math.abs(
    (x2 - x1) / (Math.cos(alpha) * Math.cos(ARROW_ANGLE))
  );
  const arrowHeight = Math.min(minArrowHeight, 6 + width * 2);
  const d = x2 < x1 ? -1 : 1;
  const [x3, y3] = [
    x2 - Math.cos(alpha - ARROW_ANGLE) * arrowHeight * d,
    y2 - Math.sin(alpha - ARROW_ANGLE) * arrowHeight * d,
  ];
  const [x4, y4] = [
    x2 - Math.cos(alpha + ARROW_ANGLE) * arrowHeight * d,
    y2 - Math.sin(alpha + ARROW_ANGLE) * arrowHeight * d,
  ];
  const [xa, ya] = [(x4 - x3) / 3, (y4 - y3) / 3];
  const [x5, y5] = [x3 + xa, y3 + ya];
  const [x6, y6] = [x4 - xa, y4 - ya];
  const paths: Point[] = [
    [x1, y1],
    [x5, y5],
    [x3, y3],
    [x2, y2],
    [x4, y4],
    [x6, y6],
  ];
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  paths.slice(1).forEach((point) => ctx.lineTo(...point));
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  lineWidth: number,
  strokeStyle: CanvasFillStrokeStyles['strokeStyle']
) {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(...startPoint);
  ctx.lineTo(...endPoint);
  ctx.stroke();
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  lineWidth: number,
  strokeStyle: CanvasFillStrokeStyles['strokeStyle']
) {
  const [[x1, y1], [x2, y2]] = [startPoint, endPoint];
  const paths: Point[] = [startPoint, [x1, y2], endPoint, [x2, y1]];
  ctx.beginPath();
  ctx.moveTo(...startPoint);
  paths.slice(1).forEach((point) => ctx.lineTo(...point));
  ctx.closePath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  lineWidth: number,
  strokeStyle: CanvasFillStrokeStyles['strokeStyle']
) {
  const [[x1, y1], [x2, y2]] = [startPoint, endPoint];
  const [r1, r2] = [x1 - x2, y1 - y2].map((n) => Math.abs(n / 2));
  const [x0, y0] = [(x1 + x2) >> 1, (y1 + y2) >> 1];
  const r = Math.max(r1, r2);
  const [rx, ry] = [r1 / r, r2 / r];
  ctx.save();
  ctx.scale(rx, ry);
  ctx.beginPath();
  ctx.arc(x0 / rx, y0 / ry, r, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.restore();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

export function drawCurve(
  ctx: CanvasRenderingContext2D,
  path: Point[],
  lineWidth: number,
  strokeStyle: CanvasFillStrokeStyles['strokeStyle']
) {
  if (path.length < 2) return;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.lineCap = 'round';
  ctx.beginPath();
  let startPoint = path[0];
  ctx.moveTo(...startPoint);
  for (let i = 1; i < path.length - 1; i++) {
    /** controlPoint, nextPoint */
    const [[cx, cy], [nx, ny]] = path.slice(i, i + 2);
    /** endPoint */
    const [ex, ey] = [cx + (nx - cx) / 2, cy + (ny - cy) / 2];
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    startPoint = [ex, ey];
  }
  ctx.lineTo(...path.slice(-1)[0]);
  ctx.stroke();
  ctx.closePath();
}

export function drawMosaic(
  ctx: CanvasRenderingContext2D,
  path: Point[],
  size = 10,
  brushWidth = 30,
  data?: Uint8ClampedArray
) {
  const { height, width } = ctx.canvas;
  const drawData = createDrawMosaicLayerData(
    width,
    height,
    path,
    brushWidth >> 1
  );
  const [wl, hl] = [Math.ceil(width / size), Math.ceil(height / size)];
  const originalData = ctx.getImageData(0, 0, width, height).data;
  const newData = new Uint8ClampedArray((width * height) << 2);
  // 连续绘制的的时候使用下笔前的 mosaic data，回退操作绘制时使用当前步骤执行前的画布生成的data
  data ??= createMosaicData(ctx, size);
  for (let y = 0; y < hl; y++) {
    const [startY, endY] = [y * size, Math.min((y + 1) * size, height)];
    for (let x = 0; x < wl; x++) {
      const [startX, endX] = [x * size, Math.min((x + 1) * size, width)];
      let index = (y * wl + x) << 2;
      const R = data[index++],
        G = data[index++],
        B = data[index];
      for (let y0 = startY; y0 < endY; y0++) {
        for (let x0 = startX; x0 < endX; x0++) {
          const dIndex = y0 * width + x0;
          let nIndex = dIndex << 2;
          if (drawData[dIndex]) {
            newData[nIndex++] = R;
            newData[nIndex++] = G;
            newData[nIndex++] = B;
            newData[nIndex] = 255;
          } else {
            newData[nIndex] = originalData[nIndex];
            newData[++nIndex] = originalData[nIndex];
            newData[++nIndex] = originalData[nIndex];
            newData[++nIndex] = originalData[nIndex];
          }
        }
      }
    }
  }
  ctx.putImageData(new ImageData(newData, width, height), 0, 0);
}
