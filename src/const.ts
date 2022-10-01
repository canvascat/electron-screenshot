import type { CmdAction, ResizePoint } from './type';

export const RESIZE_POINTS: readonly ResizePoint[] = [
  { position: ['top'], cursor: 'ns-resize' },
  { position: ['bottom'], cursor: 'ns-resize' },
  { position: ['left'], cursor: 'ew-resize' },
  { position: ['right'], cursor: 'ew-resize' },
  { position: ['top', 'left'], cursor: 'nwse-resize' },
  { position: ['bottom', 'right'], cursor: 'nwse-resize' },
  { position: ['top', 'right'], cursor: 'nesw-resize' },
  { position: ['bottom', 'left'], cursor: 'nesw-resize' },
];

export const OPT_ACTIONS: CmdAction[] = [
  { icon: '↩', label: '撤销', id: 'RETURN' },
  { icon: '⚡', label: '更换底图(使用本地文件)', id: 'USE_UPLOAD_FILE' },
  { icon: '✂', label: '更换底图(使用屏幕快照)', id: 'USE_SCREEN_CAPTURE' },
  { icon: '⬇', label: '保存(下载图片)', id: 'SAVE' },
  { icon: '❌', label: '取消', id: 'CANCEL' },
  { icon: '✔', label: '确定(复制到剪切板)', id: 'CONFIRM' },
];
