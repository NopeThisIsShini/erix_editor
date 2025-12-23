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

```typescript
// Subscribe
const unsubscribe = api.on('change', ({ content }) => {
  console.log(content.html);
  console.log(content.json);
  console.log(content.text);
});

// Unsubscribe
unsubscribe();
```

| Event             | Payload                          |
| ----------------- | -------------------------------- |
| `change`          | `{ content: EditorContent }`     |
| `selectionChange` | `{ selection: EditorSelection }` |
| `focus`           | `undefined`                      |
| `blur`            | `undefined`                      |
| `ready`           | `undefined`                      |
| `destroy`         | `undefined`                      |

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
