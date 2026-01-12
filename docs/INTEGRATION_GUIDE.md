# Erix Editor - Integration Guide

A rich text editor component with built-in toolbar and plugin system. Just add the component and configure what you need.

---

## Installation

```bash
npm install erixeditor
```

---

## Quick Start

```html
<erix-editor id="editor"></erix-editor>

<script type="module">
  import 'erixeditor';

  const editor = document.querySelector('#editor');

  editor.config = {
    toolbar: {
      items: [
        'undo',
        'redo',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'superscript',
        'subscript',
        'uppercase',
        'lowercase',
        'bullet-list',
        'ordered-list',
        'page-break',
        'print',
      ],
    },
    theme: 'light',
    placeholder: 'Start typing...',
  };
</script>
```

---

## Framework Integration

### React

Use the `erix-editor` custom element directly. Since React 19, custom elements are fully supported with standard property and event bindings!

```tsx
import { defineCustomElements } from 'erixeditor/loader';

// Define custom elements
defineCustomElements();
import './App.css';

function App() {
  const handleReady = (event: any) => {
    const api = event.detail.api;
    api.setContent('<p>Hello React!</p>', 'html');
  };

  const handleContentChange = (event: any) => {
    console.log('Content:', event.detail.content);
  };

  return (
    <>
      <erix-editor
        config={{
          toolbar: {
            items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list'],
          },
          theme: 'light',
        }}
        onerix-ready={handleReady}
        onerix-content-change={handleContentChange}
      />
    </>,
  );
}

export default App;
```

#### TypeScript Setup

Create a file named `src/erix-editor.d.ts` (or add to your existing declarations) to properly type the custom element:

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

> **Note for React < 19:** You may need to use `ref` to assign complex properties like `config` and use `addEventListener` for custom events.

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
  template: `
    <erix-editor [config]="editorConfig" (erix-ready)="onReady($event)" (erix-content-change)="onContentChange($event)"> </erix-editor>
    <p>Characters: {{ charCount }}</p>
  `,
})
export class AppComponent {
  charCount = 0;
  private api: any;

  editorConfig = {
    toolbar: {
      items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list'],
    },
    theme: 'light',
  };

  onReady(event: any) {
    this.api = event.detail.api;
    this.api.setContent('<p>Hello Angular!</p>', 'html');
  }

  onContentChange(event: any) {
    const { content } = event.detail;
    this.charCount = content.text.length;
  }
}
```

### Vue

Vue 3 has excellent support for custom elements. Just use the tag directly!

```vue
<script setup>
import { defineCustomElements } from 'erixeditor/loader';

// Define custom elements
defineCustomElements();

const editorConfig = {
  toolbar: {
    items: ['undo', 'redo', 'bold', 'italic', 'bullet-list'],
  },
  theme: 'light',
};

function onReady(event) {
  const api = event.detail.api;
  api.setContent('<p>Hello Vue!</p>', 'html');
}

function onContentChange(event) {
  console.log('Content:', event.detail.content);
}
</script>

<template>
  <erix-editor :config="editorConfig" @erix-ready="onReady" @erix-content-change="onContentChange" />
</template>
```

#### Configuration (Vite)

To avoid "failed to resolve component" warnings, configure Vite to recognize custom elements:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('erix-'),
        },
      },
    }),
  ],
});
```

### Vanilla JavaScript / CDN

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="https://unpkg.com/erixeditor/dist/erixeditor/erixeditor.esm.js"></script>
  </head>
  <body>
    <erix-editor id="editor"></erix-editor>

    <script type="module">
      const editor = document.querySelector('#editor');

      editor.config = {
        toolbar: {
          items: ['undo', 'redo', 'bold', 'italic', 'underline'],
        },
      };

      editor.addEventListener('erix-ready', e => {
        const api = e.detail.api;
        api.setContent('<p>Hello World!</p>', 'html');
      });
    </script>
  </body>
</html>
```

---

## Configuration Reference

```javascript
editor.config = {
  // Toolbar - only these items will show
  toolbar: {
    items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list'],
  },

  // Theme
  theme: 'light', // 'light' | 'dark'

  // Editor options
  placeholder: 'Start typing...',
  readonly: false,

  // Initial content
  content: '<p>Hello World</p>',

  // Default font settings
  defaultFontSize: '12pt',
  defaultFontFamily: 'Arial, sans-serif',
};
```

---

## Available Toolbar Items

| Item ID         | Group      | Description    | Shortcut |
| --------------- | ---------- | -------------- | -------- |
| `undo`          | history    | Undo           | Ctrl+Z   |
| `redo`          | history    | Redo           | Ctrl+Y   |
| `bold`          | formatting | Bold           | Ctrl+B   |
| `italic`        | formatting | Italic         | Ctrl+I   |
| `underline`     | formatting | Underline      | Ctrl+U   |
| `strikethrough` | formatting | Strikethrough  | -        |
| `superscript`   | formatting | Superscript    | -        |
| `subscript`     | formatting | Subscript      | -        |
| `uppercase`     | textcase   | Uppercase      | -        |
| `lowercase`     | textcase   | Lowercase      | -        |
| `bullet-list`   | lists      | Bullet list    | -        |
| `ordered-list`  | lists      | Numbered list  | -        |
| `page-break`    | insert     | Page break     | -        |
| `print`         | tools      | Print          | Ctrl+P   |
| `font-family`   | font       | Font selection | -        |
| `font-size`     | font       | Size selection | -        |
| `import-word`   | tools      | Import .docx   | -        |

**Auto-grouping:** Dividers are automatically inserted between different groups.

---

## API Reference

### Properties

| Property      | Type    | Description               |
| ------------- | ------- | ------------------------- |
| `config`      | object  | Full configuration object |
| `theme`       | string  | 'light' or 'dark'         |
| `placeholder` | string  | Placeholder text          |
| `readonly`    | boolean | Read-only mode            |
| `content`     | string  | Initial HTML content      |

### API Methods

Access via `erix-ready` event:

```javascript
editor.addEventListener('erix-ready', e => {
  const api = e.detail.api;

  // Content
  api.setContent('<p>Hello</p>', 'html');
  api.getContent('html');
  api.getContent('json');

  // Focus
  api.focus();
  api.blur();

  // History
  api.undo();
  api.redo();
  api.canUndo();
  api.canRedo();

  // Commands
  api.bold();
  api.italic();
  api.setFontSize('14pt');
  api.setTextAlignment('center');
  api.setHeading(1);
  api.invokePlugin('bold');
  api.isPluginActive('bold');
  api.registerPlugin({
    id: 'my-command',
    label: 'My Cmd',
    execute: () => {
      alert('Hi');
      return true;
    },
  });
  api.invokePlugin('my-command');

  // Events
  api.on('change', ({ content }) => console.log(content));
  api.on('focus', () => {});
  api.on('blur', () => {});

  // Cleanup
  api.destroy();
});
```

---

## Content API

The Content API provides methods to get, set, and listen to editor content changes in real-time.

### Getting Content

```javascript
editor.addEventListener('erix-ready', e => {
  const api = e.detail.api;

  // Get as HTML string
  const html = api.getContent('html');
  // Returns: "<p>Hello <strong>World</strong></p>"

  // Get as plain text
  const text = api.getContent('text');
  // Returns: "Hello World"

  // Get as JSON (ProseMirror document format)
  const json = api.getContent('json');
  // Returns: { type: "doc", content: [...] }

  // Get all formats at once
  const content = api.getContent();
  // Returns: { html: "...", text: "...", json: {...} }
});
```

### Setting Content

```javascript
editor.addEventListener('erix-ready', e => {
  const api = e.detail.api;

  // Set content from HTML
  api.setContent('<p>Hello <strong>World</strong>!</p>', 'html');

  // Set content from plain text
  api.setContent('Hello World!', 'text');

  // Set content from JSON
  api.setContent(
    {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello World!' }],
        },
      ],
    },
    'json',
  );

  // Clear all content
  api.clearContent();

  // Check if editor is empty
  const empty = api.isEmpty();
});
```

### Listening to Content Changes (Real-time)

The `change` event fires every time the document changes (typing, formatting, pasting, etc.):

```javascript
editor.addEventListener('erix-ready', e => {
  const api = e.detail.api;

  // Subscribe to content changes
  const unsubscribe = api.on('change', ({ content }) => {
    console.log('HTML:', content.html);
    console.log('Text:', content.text);
    console.log('JSON:', content.json);

    // Auto-save to localStorage
    localStorage.setItem('draft', content.html);

    // Send to backend API
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.html }),
    });
  });

  // Unsubscribe when done
  // unsubscribe();
});
```

### Content via Props (Declarative)

```html
<!-- Set initial content via attribute -->
<erix-editor content="<p>Initial content here</p>"></erix-editor>
```

```javascript
// Update content dynamically via property
document.querySelector('erix-editor').content = '<p>New content!</p>';
```

### Complete Content Workflow Example

```javascript
const editor = document.querySelector('#editor');

editor.addEventListener('erix-ready', e => {
  const api = e.detail.api;

  // 1. Set initial content
  api.setContent('<p>Welcome to <strong>Erix Editor</strong>!</p>', 'html');

  // 2. Listen for real-time changes
  api.on('change', ({ content }) => {
    // Auto-save to localStorage
    localStorage.setItem('erix-draft', content.html);

    // Update character count
    document.getElementById('char-count').textContent = content.text.length;

    // Update word count
    const words = content.text
      .trim()
      .split(/\s+/)
      .filter(w => w).length;
    document.getElementById('word-count').textContent = words;
  });

  // 3. Restore saved draft on load
  const savedDraft = localStorage.getItem('erix-draft');
  if (savedDraft) {
    api.setContent(savedDraft, 'html');
  }

  // 4. Get content on form submit
  document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const htmlContent = api.getContent('html');
    const jsonContent = api.getContent('json');

    // Send to server
    fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: htmlContent,
        json: jsonContent,
      }),
    });
  });
});
```

### Content Format Reference

| Format | Method               | Returns              | Use Case                           |
| ------ | -------------------- | -------------------- | ---------------------------------- |
| HTML   | `getContent('html')` | `string`             | Display, storage, server sync      |
| Text   | `getContent('text')` | `string`             | Search, character count, preview   |
| JSON   | `getContent('json')` | `EditorDocumentJSON` | Full fidelity storage, restoration |
| All    | `getContent()`       | `EditorContent`      | When you need multiple formats     |

### Framework Usage

You can use the API methods within your framework components by accessing the `api` object from the `erix-ready` event.

**React:**

```tsx
const handleReady = (event: any) => {
  const api = event.detail.api;
  api.on('change', ({ content }: any) => {
    console.log('Content changed:', content.html);
  });
};
```

**Angular:**

```typescript
onReady(event: any) {
  this.api = event.detail.api;
  this.api.on('change', ({ content }: any) => {
    this.content = content.html;
  });
}
```

**Vue:**

```javascript
function onReady(event) {
  const api = event.detail.api;
  api.on('change', ({ content: c }) => {
    content.value = c.html;
  });
}
```

## DOM Events

Erix Editor emits DOM events directly on the `<erix-editor>` element. This makes it simple to listen for changes in any framework without needing the API.

### Available DOM Events

| Event                   | Detail                           | Description                                              |
| ----------------------- | -------------------------------- | -------------------------------------------------------- |
| `erix-content-change`   | `{ content: EditorContent }`     | Fired on every content change (typing, formatting, etc.) |
| `erix-selection-change` | `{ selection: EditorSelection }` | Fired when selection/cursor changes                      |
| `erix-focus`            | `undefined`                      | Fired when editor gains focus                            |
| `erix-blur`             | `undefined`                      | Fired when editor loses focus                            |
| `erix-ready`            | `{ api: ErixEditorAPI }`         | Fired when editor is initialized                         |

### EditorContent Type

```typescript
interface EditorContent {
  html: string; // HTML string representation
  text: string; // Plain text representation
  json: EditorDocumentJSON; // ProseMirror JSON document
}
```

### Vanilla JavaScript

```html
<erix-editor id="editor"></erix-editor>

<script>
  const editor = document.getElementById('editor');

  // Listen for content changes
  editor.addEventListener('erix-content-change', e => {
    const { content } = e.detail;
    console.log('HTML:', content.html);
    console.log('Text:', content.text);

    // Auto-save to localStorage
    localStorage.setItem('draft', content.html);
  });

  // Listen for selection changes
  editor.addEventListener('erix-selection-change', e => {
    const { selection } = e.detail;
    console.log('Cursor at:', selection.from);
    console.log('Selected text:', selection.selectedText);
  });

  // Listen for focus/blur
  editor.addEventListener('erix-focus', () => console.log('Focused'));
  editor.addEventListener('erix-blur', () => console.log('Blurred'));
</script>
```

### Framework Usage

You can listen to specialized events like `erix-selection-change`, `erix-focus`, and `erix-blur` using the same event binding syntax as `erix-content-change`. See the [Framework Integration](#framework-integration) section for setup details.

**React:**

```tsx
<erix-editor ref={editorRef} onerix-selection-change={(e: any) => console.log('Selection:', e.detail.selection)} onerix-focus={() => console.log('Focused')} />
```

**Angular:**

```html
<erix-editor (erix-selection-change)="onSelectionChange($event)" (erix-focus)="onFocus()"> </erix-editor>
```

**Vue:**

```html
<erix-editor @erix-selection-change="onSelectionChange" @erix-focus="onFocus" />
```

### Svelte

```svelte
<script>
  let content = '';
  let charCount = 0;

  function onContentChange(event) {
    const { content: c } = event.detail;
    content = c.html;
    charCount = c.text.length;
  }
</script>

<erix-editor on:erix-content-change={onContentChange} />
<p>Characters: {charCount}</p>
```

---

## Examples

### Minimal Toolbar

```javascript
editor.config = {
  toolbar: { items: ['bold', 'italic'] },
};
```

### Full Toolbar

```javascript
editor.config = {
  toolbar: {
    items: [
      'undo',
      'redo',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'superscript',
      'subscript',
      'uppercase',
      'lowercase',
      'bullet-list',
      'ordered-list',
      'page-break',
      'print',
    ],
  },
};
```

### Dark Theme

```javascript
editor.config = {
  toolbar: { items: ['bold', 'italic'] },
  theme: 'dark',
};
```

### Read-Only Mode

```javascript
editor.config = {
  toolbar: { items: [] }, // No toolbar
  readonly: true,
};
editor.content = '<p>Read-only content</p>';
```

---

## TypeScript Support

```typescript
import type { EditorConfig, ErixEditorAPI } from 'erixeditor';

const config: EditorConfig = {
  toolbar: {
    items: ['bold', 'italic', 'underline'],
  },
  theme: 'light',
};
```
