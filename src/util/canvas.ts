import { bound, mosaicOriginalPxData, mainCtx, sourceRef } from '@/store';
import type { ActionHistoryItem } from '@/type';
import { DEFAULT_COLOR, DEFAULT_WIDTH } from './const';
import {
  drawArrow,
  drawCurve,
  drawEllipse,
  drawLine,
  drawMosaic,
  drawRect,
} from './paint';

export { createMosaicData } from './mosaic';

export const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise((resolve: (file: Blob) => void, reject: (err: Error) => void) =>
    canvas.toBlob((file) =>
      file ? resolve(file) : reject(new Error('Failed to convert file'))
    )
  );

export function copyCanvas(
  image: CanvasImageSource,
  sx: number,
  sy: number,
  width: number,
  height: number
) {
  const canvas = document.createElement('canvas');
  Object.assign(canvas, { height, width });
  const ctx = canvas.getContext('2d');
  ctx!.drawImage(image, sx, sy, width, height, 0, 0, width, height);
  return canvas;
}

export function downloadCanvas(
  image: CanvasImageSource,
  sx: number,
  sy: number,
  width: number,
  height: number
) {
  const canvas = copyCanvas(image, sx, sy, width, height);
  const url = canvas.toDataURL('image/png');
  canvasToBlob(canvas).then(console.log);
  const link = document.createElement('a');
  link.download = `导出图片${Date.now()}.png`;
  link.href = url;
  link.click();
}

export async function writeCanvasToClipboard(canvas: HTMLCanvasElement) {
  const { state } = await navigator.permissions.query({
    name: 'clipboard-write' as PermissionName,
  });
  if (state !== 'granted') throw new Error('clipboard-permission not granted');
  const blobPromise = canvasToBlob(canvas);
  const blob = await blobPromise; /* canvasToBlob(canvas) */
  // https://stackoverflow.com/questions/58312058/navigator-clipboard-write-clipboard-iterator-getter-is-not-callable
  // https://stackoverflow.com/questions/57278923/chrome-76-copy-content-to-clipboard-using-navigator
  return navigator.clipboard.write([
    new ClipboardItem({ [blob.type]: blobPromise }),
  ]);
}

export function updateCanvas(
  actionHistory: ActionHistoryItem[],
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource = sourceRef.value!
) {
  ctx.clearRect(0, 0, bound.x.max, bound.y.max);
  ctx.drawImage(image, 0, 0);
  actionHistory.forEach((item) => {
    const { width = DEFAULT_WIDTH, color = DEFAULT_COLOR } = item.attr ?? {};
    switch (item.id) {
      case 'LINE': {
        const [startPoint, endPoint] = item.path!;
        drawLine(ctx, startPoint, endPoint, width, color);
        break;
      }
      case 'RECT': {
        const [startPoint, endPoint] = item.path!;
        drawRect(ctx, startPoint, endPoint, width, color);
        break;
      }
      case 'ARROW': {
        const [startPoint, endPoint] = item.path!;
        drawArrow(ctx, startPoint, endPoint, width, color);
        break;
      }
      case 'ELLIPSE': {
        const [startPoint, endPoint] = item.path!;
        drawEllipse(ctx, startPoint, endPoint, width, color);
        break;
      }
      // TODO: 当path.length较长，绘制会出现卡顿，使用snapshot
      case 'BRUSH':
        drawCurve(ctx, item.path!, width, color);
        break;
      case 'MOSAIC':
        drawMosaic(ctx, item.path!, 10, 30, mosaicOriginalPxData.value!);
        break;
      default:
        break;
    }
  });
}
