# Erix Editor - Quick Start Guide

A modern, framework-agnostic rich text editor with a powerful plugin system.

## Installation

```bash
npm install erix
```

## Quick Start

### HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="node_modules/erix/dist/erix/erix.esm.js"></script>
  </head>
  <body>
    <erix-editor id="editor" theme="light"></erix-editor>

    <script type="module">
      document.querySelector('#editor').addEventListener('erix-ready', e => {
        const api = e.detail.api;

        // Set content
        api.setContent('<p>Hello <strong>World</strong>!</p>', 'html');

        // Listen for changes
        api.on('change', ({ content }) => {
          console.log('HTML:', content.html);
          console.log('JSON:', content.json);
        });
      });
    </script>
  </body>
</html>
```

### React

```tsx
import { useRef, useEffect } from 'react';
import { defineCustomElements } from 'erix/loader';
import type { ErixEditorAPI } from 'erix';

defineCustomElements(window);

function Editor() {
  const editorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    const handleReady = (e: CustomEvent<{ api: ErixEditorAPI }>) => {
      const api = e.detail.api;
      api.setContent('<p>Hello React!</p>', 'html');
    };
    el?.addEventListener('erix-ready', handleReady);
    return () => el?.removeEventListener('erix-ready', handleReady);
  }, []);

  return <erix-editor ref={editorRef as any} theme="light" />;
}
```

### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { defineCustomElements } from 'erix/loader';

defineCustomElements(window);

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

```typescript
// component.ts
@Component({
  template: `<erix-editor (erix-ready)="onReady($event)"></erix-editor>`,
})
export class EditorComponent {
  onReady(event: CustomEvent) {
    const api = event.detail.api;
    api.setContent('<p>Hello Angular!</p>', 'html');
  }
}
```

### Vue

```vue
<template>
  <erix-editor ref="editor" @erix-ready="onReady" />
</template>

<script setup>
import { defineCustomElements } from 'erix/loader';
defineCustomElements(window);

const onReady = e => {
  const api = e.detail.api;
  api.setContent('<p>Hello Vue!</p>', 'html');
};
</script>
```

---

## API Overview

```typescript
const api = await editorElement.getAPI();

// Content
api.setContent('<p>Hello</p>', 'html');
api.getContent('html'); // string
api.getContent('json'); // EditorDocumentJSON
api.getContent('text'); // string
api.clearContent();
api.isEmpty();

// Focus
api.focus();
api.blur();
api.hasFocus();

// Selection
api.getSelection();
api.setSelection(0, 10);
api.selectAll();

// History
api.undo();
api.redo();
api.canUndo();
api.canRedo();

// Plugins
api.invokePlugin('bold');
api.isPluginActive('bold');
api.registerPlugin({ id: 'my-plugin', label: 'My Plugin', execute: () => true });
api.enablePlugin('bold');
api.disablePlugin('strikethrough');

// Events
api.on('change', ({ content }) => console.log(content));
api.on('selectionChange', ({ selection }) => console.log(selection));
api.on('focus', () => console.log('focused'));
api.on('blur', () => console.log('blurred'));
```

---

## Content API

The Content API provides methods to get, set, and listen to editor content changes.

### Getting Content

```typescript
const api = await editorElement.getAPI();

// Get content as HTML string
const htmlContent = api.getContent('html');
// Returns: '<p>Hello <strong>World</strong>!</p>'

// Get content as plain text
const textContent = api.getContent('text');
// Returns: 'Hello World!'

// Get content as ProseMirror JSON document
const jsonContent = api.getContent('json');
// Returns: { type: 'doc', content: [...] }

// Get all formats at once
const allFormats = api.getContent();
// Returns: { html: '...', text: '...', json: {...} }
```

### Setting Content

```typescript
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
```

### Listening to Content Changes

The `change` event fires every time the document content changes (typing, formatting, pasting, etc.):

```typescript
// Subscribe to changes
const unsubscribe = api.on('change', ({ content }) => {
  console.log('HTML:', content.html);
  console.log('Text:', content.text);
  console.log('JSON:', content.json);

  // Example: Auto-save to localStorage
  localStorage.setItem('draft', content.html);

  // Example: Send to backend API
  fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content.html }),
  });
});

// Unsubscribe when done
unsubscribe();
```

### Content via Props (Declarative)

You can also set content declaratively via the `content` attribute/prop:

```html
<!-- Set initial content -->
<erix-editor content="<p>Initial content here</p>"></erix-editor>
```

```typescript
// Update content dynamically
document.querySelector('erix-editor').content = '<p>New content!</p>';
```

### Complete Content Workflow Example

```typescript
const editor = document.querySelector('erix-editor');

editor.addEventListener('erix-ready', async event => {
  const api = event.detail.api;

  // 1. Set initial content
  api.setContent('<p>Welcome to <strong>Erix Editor</strong>!</p>', 'html');

  // 2. Listen for real-time changes
  api.on('change', ({ content }) => {
    // Auto-save to localStorage
    localStorage.setItem('erix-draft', content.html);

    // Update character count
    document.getElementById('char-count').textContent = content.text.length;
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
    // Send to server...
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

---

## Configuration

```typescript
const editorConfig = {
  plugins: {
    builtin: ['bold', 'italic', 'underline', 'undo', 'redo'],
    disabled: ['strikethrough'],
    custom: [myCustomPlugin],
  },
  toolbar: {
    items: ['undo', 'redo', '|', 'bold', 'italic', 'underline'],
  },
  placeholder: 'Start typing...',
  theme: 'light',
};

// Via property
editor.config = editorConfig;

// Or via attributes
<erix-editor theme="light" placeholder="Start typing..."></erix-editor>;
```

---

## Built-in Plugins

| ID              | Description        | Shortcut    |
| --------------- | ------------------ | ----------- |
| `bold`          | Bold text          | Mod+B       |
| `italic`        | Italic text        | Mod+I       |
| `underline`     | Underline text     | Mod+U       |
| `strikethrough` | Strikethrough text | Mod+Shift+S |
| `bullet-list`   | Bullet list        | -           |
| `ordered-list`  | Numbered list      | -           |
| `align-left`    | Align left         | -           |
| `align-center`  | Align center       | -           |
| `align-right`   | Align right        | -           |
| `align-justify` | Justify            | -           |
| `undo`          | Undo               | Mod+Z       |
| `redo`          | Redo               | Mod+Shift+Z |

---

## Custom Plugins

```typescript
api.registerPlugin({
  id: 'insert-date',
  label: 'Insert Date',
  icon: 'calendar',
  group: 'insert',
  shortcut: 'Mod+Shift+D',

  execute: ctx => {
    console.log('Selection:', ctx.selection);
    console.log('Active marks:', ctx.activeMarks);
    return true;
  },

  isActive: ctx => false,
  canExecute: ctx => !ctx.selection.isEmpty,

  onInit: () => console.log('Plugin loaded'),
  onDestroy: () => console.log('Plugin unloaded'),
});

// Invoke it
api.invokePlugin('insert-date');
```

---

## Events

Erix Editor provides two ways to listen for events:

1. **DOM Events** - Listen directly on the element (simpler for frameworks)
2. **API Events** - Subscribe via the API (more control)

### DOM Events (Recommended for Frameworks)

Listen to events directly on the `<erix-editor>` element:

```javascript
const editor = document.querySelector('erix-editor');

// Content change event - fires on every content change
editor.addEventListener('erix-content-change', e => {
  const { content } = e.detail;
  console.log('HTML:', content.html);
  console.log('Text:', content.text);
  console.log('JSON:', content.json);
});

// Selection change event
editor.addEventListener('erix-selection-change', e => {
  const { selection } = e.detail;
  console.log('Selection:', selection.from, '-', selection.to);
});

// Focus event
editor.addEventListener('erix-focus', () => {
  console.log('Editor focused');
});

// Blur event
editor.addEventListener('erix-blur', () => {
  console.log('Editor blurred');
});

// Ready event - editor is initialized
editor.addEventListener('erix-ready', e => {
  const api = e.detail.api;
  console.log('Editor ready!');
});
```

#### DOM Events Reference

| Event                   | Detail                           | Description                      |
| ----------------------- | -------------------------------- | -------------------------------- |
| `erix-content-change`   | `{ content: EditorContent }`     | Fired on every content change    |
| `erix-selection-change` | `{ selection: EditorSelection }` | Fired when selection changes     |
| `erix-focus`            | `undefined`                      | Fired when editor gains focus    |
| `erix-blur`             | `undefined`                      | Fired when editor loses focus    |
| `erix-ready`            | `{ api: ErixEditorAPI }`         | Fired when editor is initialized |

### API Events

Subscribe to events via the API with unsubscribe support:

```typescript
const api = await editor.getAPI();

// Subscribe
const unsubscribe = api.on('change', ({ content }) => {
  console.log(content.html);
  console.log(content.json);
  console.log(content.text);
});

// Unsubscribe when done
unsubscribe();
```

| API Event         | Payload                          |
| ----------------- | -------------------------------- |
| `change`          | `{ content: EditorContent }`     |
| `selectionChange` | `{ selection: EditorSelection }` |
| `focus`           | `undefined`                      |
| `blur`            | `undefined`                      |
| `ready`           | `undefined`                      |
| `destroy`         | `undefined`                      |

### Framework Examples

#### Vanilla JavaScript

```html
<erix-editor id="editor"></erix-editor>

<script>
  const editor = document.getElementById('editor');

  // Simple: Use DOM events directly
  editor.addEventListener('erix-content-change', e => {
    console.log('Content:', e.detail.content.html);
    localStorage.setItem('draft', e.detail.content.html);
  });
</script>
```

#### React

```tsx
import { useRef, useEffect, useState } from 'react';

function MyEditor() {
  const editorRef = useRef<HTMLElement>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    const el = editorRef.current;

    const handleContentChange = (e: CustomEvent) => {
      setContent(e.detail.content.html);
    };

    el?.addEventListener('erix-content-change', handleContentChange);
    return () => el?.removeEventListener('erix-content-change', handleContentChange);
  }, []);

  return <erix-editor ref={editorRef as any} />;
}
```

#### Angular

```typescript
@Component({
  template: `
    <erix-editor (erix-content-change)="onContentChange($event)"></erix-editor>
    <p>Characters: {{ content.length }}</p>
  `,
})
export class EditorComponent {
  content = '';

  onContentChange(event: CustomEvent) {
    this.content = event.detail.content.html;
  }
}
```

#### Vue

```vue
<template>
  <erix-editor @erix-content-change="onContentChange" />
  <p>Characters: {{ content.length }}</p>
</template>

<script setup>
import { ref } from 'vue';

const content = ref('');

function onContentChange(event) {
  content.value = event.detail.content.html;
}
</script>
```

---

## TypeScript

```typescript
import type { ErixEditorAPI, EditorContent, EditorSelection, EditorConfig, ErixPluginConfig, PluginContext } from 'erix';

import { DEFAULT_EDITOR_CONFIG, DEFAULT_PLUGINS, ALL_BUILTIN_PLUGINS } from 'erix';
```

---

## More Documentation

See the full [Integration Guide](./INTEGRATION_GUIDE.md) for:

- Complete API reference
- Framework-specific patterns
- Advanced plugin development
- Toolbar customization

---

## License

MIT
