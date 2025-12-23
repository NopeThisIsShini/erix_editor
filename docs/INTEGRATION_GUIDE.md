# Erix Editor - Integration Guide

A rich text editor component with built-in toolbar and plugin system. Just add the component and configure what you need.

---

## Installation

```bash
npm install erix
```

---

## Quick Start

```html
<erix-editor id="editor"></erix-editor>

<script type="module">
  import 'erix';
  
  const editor = document.querySelector('#editor');
  
  editor.config = {
    toolbar: {
      items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list', 'ordered-list']
    },
    theme: 'light',
    placeholder: 'Start typing...'
  };
</script>
```

---

## Framework Integration

### React

Native React wrapper - no `defineCustomElements` needed!

```tsx
import { ErixEditor } from 'erix/react';

function MyEditor() {
  const handleReady = (event) => {
    const api = event.detail.api;
    api.setContent('<p>Hello React!</p>', 'html');
  };

  return (
    <ErixEditor
      config={{
        toolbar: {
          items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list']
        },
        theme: 'light'
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
import { ErixModule } from 'erix/angular';

@NgModule({
  imports: [ErixModule]
})
export class AppModule {}
```

```typescript
// app.component.ts
@Component({
  template: `
    <erix-editor
      [config]="editorConfig"
      (erixReady)="onReady($event)">
    </erix-editor>
  `
})
export class AppComponent {
  editorConfig = {
    toolbar: {
      items: ['undo', 'redo', 'bold', 'italic', 'underline']
    },
    theme: 'light'
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
import { ErixEditor } from 'erix/vue';

const editorConfig = {
  toolbar: {
    items: ['undo', 'redo', 'bold', 'italic', 'bullet-list']
  },
  theme: 'light'
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
    <script type="module" src="https://unpkg.com/erix/dist/erix/erix.esm.js"></script>
  </head>
  <body>
    <erix-editor id="editor"></erix-editor>

    <script type="module">
      const editor = document.querySelector('#editor');
      
      editor.config = {
        toolbar: {
          items: ['undo', 'redo', 'bold', 'italic', 'underline']
        }
      };

      editor.addEventListener('erix-ready', (e) => {
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
    items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list']
  },
  
  // Theme
  theme: 'light',  // 'light' | 'dark'
  
  // Editor options
  placeholder: 'Start typing...',
  readonly: false,
  
  // Initial content
  content: '<p>Hello World</p>'
};
```

---

## Available Toolbar Items

| Item ID           | Group      | Description           | Shortcut  |
|-------------------|------------|----------------------|-----------|
| `undo`            | history    | Undo                 | Ctrl+Z    |
| `redo`            | history    | Redo                 | Ctrl+Y    |
| `bold`            | formatting | Bold                 | Ctrl+B    |
| `italic`          | formatting | Italic               | Ctrl+I    |
| `underline`       | formatting | Underline            | Ctrl+U    |
| `strikethrough`   | formatting | Strikethrough        | -         |
| `superscript`     | formatting | Superscript          | -         |
| `subscript`       | formatting | Subscript            | -         |
| `uppercase`       | textcase   | Uppercase            | -         |
| `lowercase`       | textcase   | Lowercase            | -         |
| `bullet-list`     | lists      | Bullet list          | -         |
| `ordered-list`    | lists      | Numbered list        | -         |
| `page-break`      | insert     | Page break           | -         |
| `print`           | tools      | Print                | Ctrl+P    |

**Auto-grouping:** Dividers are automatically inserted between different groups.

---

## API Reference

### Properties

| Property      | Type   | Description |
|--------------|--------|-------------|
| `config`     | object | Full configuration object |
| `theme`      | string | 'light' or 'dark' |
| `placeholder`| string | Placeholder text |
| `readonly`   | boolean| Read-only mode |
| `content`    | string | Initial HTML content |

### API Methods

Access via `erix-ready` event:

```javascript
editor.addEventListener('erix-ready', (e) => {
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
  api.invokePlugin('bold');
  api.isPluginActive('bold');
  
  // Events
  api.on('change', ({ content }) => console.log(content));
  api.on('focus', () => {});
  api.on('blur', () => {});
  
  // Cleanup
  api.destroy();
});
```

---

## Getting Content

### Get Content On-Demand

```javascript
editor.addEventListener('erix-ready', (e) => {
  const api = e.detail.api;
  
  // Get as HTML string
  const html = api.getContent('html');
  // Returns: "<p>Hello <strong>World</strong></p>"
  
  // Get as plain text
  const text = api.getContent('text');
  // Returns: "Hello World"
  
  // Get as JSON (ProseMirror format)
  const json = api.getContent('json');
  // Returns: { type: "doc", content: [...] }
  
  // Get all formats at once
  const content = api.getContent();
  // Returns: { html: "...", text: "...", json: {...} }
});
```

### Get Content On Every Change

```javascript
editor.addEventListener('erix-ready', (e) => {
  const api = e.detail.api;
  
  // Listen for content changes
  api.on('change', ({ content }) => {
    console.log('HTML:', content.html);
    console.log('Text:', content.text);
    console.log('JSON:', content.json);
    
    // Save to your backend
    saveToServer(content.html);
  });
});
```

### React Example

```tsx
import { ErixEditor } from 'erix/react';
import { useState } from 'react';

function MyEditor() {
  const [content, setContent] = useState('');

  const handleReady = (event) => {
    const api = event.detail.api;
    
    // Get content on every change
    api.on('change', ({ content }) => {
      setContent(content.html);
    });
  };

  const handleSave = () => {
    console.log('Saving:', content);
    // Send to API
  };

  return (
    <div>
      <ErixEditor
        config={{ toolbar: { items: ['bold', 'italic', 'underline'] } }}
        onErixReady={handleReady}
      />
      <button onClick={handleSave}>Save</button>
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
  `
})
export class EditorComponent {
  config = { toolbar: { items: ['bold', 'italic'] } };
  private api: any;
  content: string = '';

  onReady(event: CustomEvent) {
    this.api = event.detail.api;
    
    this.api.on('change', ({ content }) => {
      this.content = content.html;
    });
  }

  save() {
    console.log('Saving:', this.content);
  }
}
```

### Vue Example

```vue
<script setup>
import { ErixEditor } from 'erix/vue';
import { ref } from 'vue';

const content = ref('');

function onReady(event) {
  const api = event.detail.api;
  
  api.on('change', ({ content: c }) => {
    content.value = c.html;
  });
}

function save() {
  console.log('Saving:', content.value);
}
</script>

<template>
  <ErixEditor :config="{ toolbar: { items: ['bold', 'italic'] } }" @erix-ready="onReady" />
  <button @click="save">Save</button>
</template>
```

---

## Examples

### Minimal Toolbar

```javascript
editor.config = {
  toolbar: { items: ['bold', 'italic'] }
};
```

### Full Toolbar

```javascript
editor.config = {
  toolbar: {
    items: [
      'undo', 'redo',
      'bold', 'italic', 'underline', 'strikethrough',
      'superscript', 'subscript',
      'uppercase', 'lowercase',
      'bullet-list', 'ordered-list',
      'page-break', 'print'
    ]
  }
};
```

### Dark Theme

```javascript
editor.config = {
  toolbar: { items: ['bold', 'italic'] },
  theme: 'dark'
};
```

### Read-Only Mode

```javascript
editor.config = {
  toolbar: { items: [] },  // No toolbar
  readonly: true
};
editor.content = '<p>Read-only content</p>';
```

---

## TypeScript Support

```typescript
import type { EditorConfig, ErixEditorAPI } from 'erix';

const config: EditorConfig = {
  toolbar: {
    items: ['bold', 'italic', 'underline']
  },
  theme: 'light'
};
```
