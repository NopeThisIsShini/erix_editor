import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'erix-editor': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        config?: any;
        content?: string;
        theme?: 'light' | 'dark' | string;
        'onerix-ready'?: (event: any) => void;
        'onerix-content-change'?: (event: any) => void;
        'onerix-selection-change'?: (event: any) => void;
        'onerix-focus'?: (event: any) => void;
        'onerix-blur'?: (event: any) => void;
      };
    }
  }
}
