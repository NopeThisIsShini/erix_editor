# Erix Editor

[![npm version](https://img.shields.io/npm/v/erixeditor.svg?style=flat-square)](https://www.npmjs.com/package/erixeditor)
[![npm downloads](https://img.shields.io/npm/dm/erixeditor.svg?style=flat-square)](https://www.npmjs.com/package/erixeditor)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/BsXK68EnrR)
[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

A powerful, lightweight rich text editor web component with built-in toolbar and plugin system. Built with [Stencil](https://stenciljs.com) and [ProseMirror](https://prosemirror.net/).

## Features

- **Rich Text Editing** – Full WYSIWYG editing experience
- **Framework Agnostic** – Works with React, Vue, Angular, or vanilla JS
- **DOCX Import** – Import Microsoft Word documents directly
- **Built-in Toolbar** – Customizable formatting toolbar
- **Plugin System** – Extend functionality with plugins
- **Lightweight** – Lazy-loaded components for optimal performance
- **Print Support** – Theme-agnostic printing
- **Theme Support** – Light and dark themes

## Installation

```bash
npm install erixeditor
```

```bash
yarn add erixeditor
```

```bash
pnpm add erixeditor
```

## Quick Start

### Using npm/bundler

```html
<erix-editor id="editor"></erix-editor>

<script type="module">
  import 'erixeditor';

  const editor = document.querySelector('#editor');

  editor.config = {
    toolbar: {
      items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list'],
    },
    theme: 'light',
    placeholder: 'Start typing...',
  };
</script>
```

### Using CDN

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="https://unpkg.com/erixeditor@latest/dist/erixeditor/erixeditor.esm.js"></script>
  </head>
  <body>
    <erix-editor id="editor"></erix-editor>

    <script type="module">
      const editor = document.querySelector('#editor');

      editor.config = {
        toolbar: {
          items: ['undo', 'redo', 'bold', 'italic', 'underline'],
        },
        theme: 'light',
      };

      editor.addEventListener('erix-ready', e => {
        const api = e.detail.api;
        api.setContent('<p>Hello World!</p>', 'html');
      });
    </script>
  </body>
</html>
```

## Framework Integration

### React

```tsx
import { defineCustomElements } from 'erixeditor/loader';

// Define custom elements
defineCustomElements();

function App() {
  const handleReady = (event: any) => {
    const api = event.detail.api;
    api.setContent('<p>Hello React!</p>', 'html');
  };

  return (
    <erix-editor
      config={{
        toolbar: { items: ['undo', 'redo', 'bold', 'italic'] },
        theme: 'light',
      }}
      onerix-ready={handleReady}
    />
  );
}
```

#### TypeScript Setup

Create `src/erix-editor.d.ts` to properly type the custom element:

```typescript
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'erix-editor': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'config'?: any;
        'content'?: string;
        'theme'?: 'light' | 'dark' | string;
        'onerix-ready'?: (event: any) => void;
        'onerix-content-change'?: (event: any) => void;
        'onerix-selection-change'?: (event: any) => void;
        'onerix-focus'?: (event: any) => void;
        'onerix-blur'?: (event: any) => void;
      };
    }
  }
}
```

### Angular

Use the Stencil loader with Angular's `CUSTOM_ELEMENTS_SCHEMA` for reliable integration:

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// Import and define Stencil custom elements
import { defineCustomElements } from 'erixeditor/loader';
defineCustomElements();

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Required for web components
})
export class AppModule {}
```

```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: ` <erix-editor [config]="editorConfig" (erix-ready)="onReady($event)" (erix-content-change)="onContentChange($event)"> </erix-editor> `,
})
export class AppComponent {
  editorConfig = {
    toolbar: { items: ['undo', 'redo', 'bold', 'italic', 'underline'] },
    theme: 'light',
  };

  onReady(event: any) {
    const api = event.detail.api;
    api.setContent('<p>Hello Angular!</p>', 'html');
  }

  onContentChange(event: any) {
    console.log('Content changed:', event.detail.content);
  }
}
```

### Vue

```vue
<script setup>
import { defineCustomElements } from 'erixeditor/loader';

// Define custom elements
defineCustomElements();

const editorConfig = {
  toolbar: { items: ['undo', 'redo', 'bold', 'italic', 'bullet-list'] },
  theme: 'light',
};

function onReady(event) {
  const api = event.detail.api;
  api.setContent('<p>Hello Vue!</p>', 'html');
}
</script>

<template>
  <erix-editor :config="editorConfig" @erix-ready="onReady" />
</template>
```

## Package Exports

| Export Path         | Description            |
| ------------------- | ---------------------- |
| `erixeditor`        | Main entry (ESM/CJS)   |
| `erixeditor/loader` | Custom elements loader |

## Documentation

For complete API reference, configuration options, and advanced usage examples, see the **[Full Integration Guide](./docs/INTEGRATION_GUIDE.md)**.

## Contributing

Erix Editor is now **open source**! We welcome contributions from everyone. Whether you're fixing a bug, adding a feature, or improving documentation, your help is appreciated.

**How to contribute:**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For discussions and community support, join our [Discord Community](https://discord.gg/BsXK68EnrR).

## Community

[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/BsXK68EnrR)

- Get help and support
- Share feedback and feature requests
- Stay updated on new releases
- Discuss contribution opportunities

## License

Erix Editor is licensed under the **MIT License**. It is totally open source and free to use for personal and commercial projects.

**Enterprise Users:**
While Erix Editor is free to use, we greatly appreciate a shout-out or support from enterprise users. If your company uses Erix Editor, let us know on [Discord](https://discord.gg/BsXK68EnrR) or mention us!

[View Full License](./LICENSE)

## Links

- [npm Package](https://www.npmjs.com/package/erixeditor)
- [Full Integration Guide](./docs/INTEGRATION_GUIDE.md)
- [Report Issues](https://github.com/NopeThisIsShini/erix_editor/issues)
- [Discord Community](https://discord.gg/BsXK68EnrR)
