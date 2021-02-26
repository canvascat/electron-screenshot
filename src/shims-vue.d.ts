declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare type Nullable<T> = T | null;

declare type CustomizedHTMLElement<T> = HTMLElement & T;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ClipboardItem {}
// eslint-disable-next-line no-var
declare var ClipboardItem: {
  prototype: ClipboardItem
  new (data: { [type: string]: Blob; }): ClipboardItem
}

interface Clipboard {
  write(dataTransfer: DataTransfer | Array<ClipboardItem>): Promise<void>
}

interface MediaDevices {
  // https://www.w3.org/TR/2021/WD-screen-capture-20210205/
  getDisplayMedia (): Promise<MediaStream>
}

declare type RefElement = Nullable<HTMLElement>
