declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare type Nullable<T> = T | null;

declare type CustomizedHTMLElement<T> = HTMLElement & T;

interface ClipboardItem {}
declare var ClipboardItem: {
  prototype: ClipboardItem;
  new (data: { [type: string]: Blob }): ClipboardItem;
};

interface Clipboard {
  write(dataTransfer: DataTransfer | Array<ClipboardItem>): Promise<void>;
}
