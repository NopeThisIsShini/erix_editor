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

Native React wrapper - no `defineCustomElements` needed!

```tsx
import { ErixEditor } from 'erixeditor/react';

function MyEditor() {
  const handleReady = event => {
    const api = event.detail.api;
    api.setContent('<p>Hello React!</p>', 'html');
  };

  return (
    <ErixEditor
      config={{
        toolbar: {
          items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list'],
        },
        theme: 'light',
      }}
      onErixReady={handleReady}
    />
  );
}
```

### Angular

Native Angular module - no `CUSTOM_ELEMENTS_SCHEMA` needed!

```typescript
// app.module.ts
import { ErixModule } from 'erixeditor/angular';

@NgModule({
  imports: [ErixModule],
})
export class AppModule {}
```

```typescript
// app.component.ts
@Component({
  template: ` <erix-editor [config]="editorConfig" (erixReady)="onReady($event)"> </erix-editor> `,
})
export class AppComponent {
  editorConfig = {
    toolbar: {
      items: ['undo', 'redo', 'bold', 'italic', 'underline'],
    },
    theme: 'light',
  };

  onReady(event: CustomEvent) {
    const api = event.detail.api;
    api.setContent('<p>Hello Angular!</p>', 'html');
  }
}
```

### Vue

Native Vue components - works naturally!

```vue
<script setup>
import { ErixEditor } from 'erixeditor/vue';

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
</script>

<template>
  <ErixEditor :config="editorConfig" @erix-ready="onReady" />
</template>
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

### React Example

```tsx
import { ErixEditor } from 'erixeditor/react';
import { useState, useCallback } from 'react';

function MyEditor() {
  const [content, setContent] = useState('');
  const [api, setApi] = useState(null);

  const handleReady = useCallback(event => {
    const editorApi = event.detail.api;
    setApi(editorApi);

    // Listen for content changes
    editorApi.on('change', ({ content }) => {
      setContent(content.html);
    });

    // Restore saved draft
    const saved = localStorage.getItem('draft');
    if (saved) editorApi.setContent(saved, 'html');
  }, []);

  const handleSave = () => {
    console.log('Saving:', content);
    localStorage.setItem('draft', content);
  };

  return (
    <div>
      <ErixEditor config={{ toolbar: { items: ['bold', 'italic', 'underline'] } }} onErixReady={handleReady} />
      <button onClick={handleSave}>Save</button>
      <p>Characters: {content.length}</p>
    </div>
  );
}
```

### Angular Example

```typescript
@Component({
  template: `
    <erix-editor [config]="config" (erixReady)="onReady($event)"></erix-editor>
    <button (click)="save()">Save</button>
    <p>Characters: {{ content.length }}</p>
  `,
})
export class EditorComponent {
  config = { toolbar: { items: ['bold', 'italic'] } };
  content: string = '';
  private api: any;

  onReady(event: CustomEvent) {
    this.api = event.detail.api;

    // Listen for content changes
    this.api.on('change', ({ content }) => {
      this.content = content.html;
    });

    // Restore saved draft
    const saved = localStorage.getItem('draft');
    if (saved) this.api.setContent(saved, 'html');
  }

  save() {
    console.log('Saving:', this.content);
    localStorage.setItem('draft', this.content);
  }
}
```

### Vue Example

````vue
<script setup>
import { ErixEditor } from 'erixeditor/vue';
import { ref, onMounted } from 'vue';

const content = ref('');
let api = null;

function onReady(event) {
  api = event.detail.api;

  // Listen for content changes
  api.on('change', ({ content: c }) => {
    content.value = c.html;
  });

  // Restore saved draft
  const saved = localStorage.getItem('draft');
  if (saved) api.setContent(saved, 'html');
}

function save() {
  console.log('Saving:', content.value);
  localStorage.setItem('draft', content.value);
}
</script>

<template>
  <ErixEditor :config="{ toolbar: { items: ['bold', 'italic'] } }" @erix-ready="onReady" />
  <button @click="save">Save</button>
  <p>Characters: {{ content.length }}</p>
</template>
---

## DOM Events

Erix Editor emits DOM events directly on the `<erix-editor>` element. This makes it simple to listen for changes in any framework without needing the API.

### Available DOM Events

| Event | Detail | Description |
|-------|--------|-------------|
| `erix-content-change` | `{ content: EditorContent }` | Fired on every content change (typing, formatting, etc.) |
| `erix-selection-change` | `{ selection: EditorSelection }` | Fired when selection/cursor changes |
| `erix-focus` | `undefined` | Fired when editor gains focus |
| `erix-blur` | `undefined` | Fired when editor loses focus |
| `erix-ready` | `{ api: ErixEditorAPI }` | Fired when editor is initialized |

### EditorContent Type

```typescript
interface EditorContent {
  html: string;        // HTML string representation
  text: string;        // Plain text representation
  json: EditorDocumentJSON;  // ProseMirror JSON document
}
````

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

### React

```tsx
import { useRef, useEffect, useState } from 'react';

function MyEditor() {
  const editorRef = useRef<HTMLElement>(null);
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    // Content change handler
    const handleContentChange = (e: CustomEvent) => {
      const { content } = e.detail;
      setContent(content.html);
      setCharCount(content.text.length);
    };

    // Selection change handler
    const handleSelectionChange = (e: CustomEvent) => {
      console.log('Selection:', e.detail.selection);
    };

    el.addEventListener('erix-content-change', handleContentChange);
    el.addEventListener('erix-selection-change', handleSelectionChange);

    return () => {
      el.removeEventListener('erix-content-change', handleContentChange);
      el.removeEventListener('erix-selection-change', handleSelectionChange);
    };
  }, []);

  return (
    <div>
      <erix-editor ref={editorRef as any} />
      <p>Characters: {charCount}</p>
    </div>
  );
}
```

### Angular

Angular automatically converts custom events to kebab-case:

```typescript
@Component({
  template: `
    <erix-editor (erix-content-change)="onContentChange($event)" (erix-selection-change)="onSelectionChange($event)" (erix-focus)="onFocus()" (erix-blur)="onBlur()"> </erix-editor>
    <p>Characters: {{ charCount }}</p>
    <p>Cursor at: {{ cursorPos }}</p>
  `,
})
export class EditorComponent {
  content = '';
  charCount = 0;
  cursorPos = 0;

  onContentChange(event: CustomEvent) {
    const { content } = event.detail;
    this.content = content.html;
    this.charCount = content.text.length;
  }

  onSelectionChange(event: CustomEvent) {
    this.cursorPos = event.detail.selection.from;
  }

  onFocus() {
    console.log('Editor focused');
  }

  onBlur() {
    console.log('Editor blurred');
  }
}
```

### Vue

Vue 3 automatically handles custom events with kebab-case:

```vue
<template>
  <erix-editor @erix-content-change="onContentChange" @erix-selection-change="onSelectionChange" @erix-focus="onFocus" @erix-blur="onBlur" />
  <p>Characters: {{ charCount }}</p>
  <p>Cursor at: {{ cursorPos }}</p>
</template>

<script setup>
import { ref } from 'vue';

const content = ref('');
const charCount = ref(0);
const cursorPos = ref(0);

function onContentChange(event) {
  const { content: c } = event.detail;
  content.value = c.html;
  charCount.value = c.text.length;
}

function onSelectionChange(event) {
  cursorPos.value = event.detail.selection.from;
}

function onFocus() {
  console.log('Editor focused');
}

function onBlur() {
  console.log('Editor blurred');
}
</script>
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
