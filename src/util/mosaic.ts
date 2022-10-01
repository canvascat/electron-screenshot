import type { Point } from '@/type';

/**
 * TODO: 利用 drawCurve 方法生成路径
 */
export const createDrawMosaicLayerData = (
  width: number,
  height: number,
  path: Point[],
  r: number
) =>
  path.reduce<boolean[]>((data, [x0, y0]) => {
    const [startX, endX] = [Math.max(0, x0 - r), Math.min(x0 + r, width)];
    const [startY, endY] = [Math.max(0, y0 - r), Math.min(y0 + r, height)];
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if ((x - x0) ** 2 + (y - y0) ** 2 < r ** 2) {
          data[y * width + x] = true;
        }
      }
    }
    return data;
  }, Array(width * height).fill(false));

export function createMosaicData(ctx: CanvasRenderingContext2D, size = 10) {
  const { width, height } = ctx.canvas;
  const [wl, hl] = [Math.ceil(width / size), Math.ceil(height / size)];
  const data = ctx.getImageData(0, 0, width, height).data;
  const md = new Uint8ClampedArray((wl * hl) << 2);
  for (let i = 0; i < wl * hl; i++) {
    const sy = (i / wl) | 0;
    const sx = i - sy * wl;
    let sumR = 0,
      sumG = 0,
      sumB = 0,
      total = 0;
    for (let y = sy * size; y < Math.min((sy + 1) * size, height); y++) {
      const startY = y * width;
      for (let x = sx * size; x < Math.min((sx + 1) * size, width); x++) {
        let sIndex = (startY + x) << 2;
        sumR += data[sIndex++];
        sumG += data[sIndex++];
        sumB += data[sIndex];
        total++;
      }
    }
    let startIndex = i << 2;
    md[startIndex++] = sumR / total;
    md[startIndex++] = sumG / total;
    md[startIndex++] = sumB / total;
    md[startIndex] = 255;
  }
  return md;
}

/**
 * 合并像素点
 * @param source
 * @param size
 * @returns
 */
export const mergeImageDataPixel = (source: ImageData, size: number) => {
  const { width, height, data, colorSpace } = source;
  const nw = Math.ceil(width / size);
  const nh = Math.ceil(height / size);
  const nl = nw * nh;
  const result = new Uint8ClampedArray(nl << 2);

  for (let offset = 0; offset < nl; offset++) {
    const sy = (offset / nh) | 0;
    const sx = offset - sy * nh;
    let sumR = 0,
      sumG = 0,
      sumB = 0,
      total = 0;
    for (let y = sy * size; y < Math.min((sy + 1) * size, height); y++) {
      const startY = y * width;
      for (let x = sx * size; x < Math.min((sx + 1) * size, width); x++) {
        let sIndex = (startY + x) << 2;
        if (data[sIndex + 3] === 0) continue;
        sumR += data[sIndex++];
        sumG += data[sIndex++];
        sumB += data[sIndex];
        total++;
      }
    }
    result.set(
      total === 0
        ? [0, 0, 0, 0]
        : [sumR / total, sumG / total, sumB / total, 255],
      offset << 2
    );
  }
  return new ImageData(result, width, height, { colorSpace });
};
