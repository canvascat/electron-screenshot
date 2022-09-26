import type { Point } from '@/type';
import { canvasToBlob } from './canvas';

export const sleep = (t = 0) =>
  new Promise((resolve) => setTimeout(resolve, t));

export const pointDistance = ([x0, y0]: Point, [x1, y1]: Point) =>
  ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5;

export async function createNotification(
  options?: NotificationOptions,
  title = document.title
): Promise<Notification> {
  if (!('Notification' in window))
    throw new Error('This browser does not support notification');
  if (Notification.permission === 'granted') {
    options!.icon ||=
      document.querySelector('link[rel*=icon]')?.getAttribute('href') ??
      undefined;
    return new Notification(title, options);
  }
  if (Notification.permission === 'denied')
    throw new Error('notification permission denied');
  await Notification.requestPermission();
  return await createNotification(options, title);
}

export async function getScreenCapture() {
  const stream = await navigator.mediaDevices.getDisplayMedia();
  const video = await new Promise(
    (resolve: (video: HTMLVideoElement) => void, reject) => {
      const video = document.createElement('video');
      video.setAttribute('autoplay', 'true');
      sleep(1000).then(reject);
      video.onplay = () => resolve(video);
      video.srcObject = stream;
    }
  );
  const { videoHeight: height, videoWidth: width } = video;
  const canvas = document.createElement('canvas');
  Object.assign(canvas, { height, width });
  canvas.getContext('2d')?.drawImage(video, 0, 0);
  const tracks = (video.srcObject as MediaStream).getTracks();
  tracks.forEach((track) => track.stop());
  video.srcObject = null;
  return canvasToBlob(canvas);
}
