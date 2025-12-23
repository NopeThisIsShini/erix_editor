# Erix Editor - Framework Integration Guide

A comprehensive guide for integrating the Erix rich text editor into your application.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Plugin System](#plugin-system)
- [Vanilla JavaScript](#vanilla-javascript)
- [React](#react)
- [Angular](#angular)
- [Vue.js](#vuejs)
- [API Reference](#api-reference)
- [Events](#events)
- [TypeScript Support](#typescript-support)

---

## Installation

```bash
npm install erix
```

---

## Quick Start

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="node_modules/erix/dist/erix/erix.esm.js"></script>
  </head>
  <body>
    <erix-editor id="editor"></erix-editor>

    <script type="module">
      const editor = document.querySelector('#editor');
      editor.addEventListener('erix-ready', e => {
        const api = e.detail.api;
        api.setContent('<p>Hello World!</p>', 'html');
      });
    </script>
  </body>
</html>
```

---

## Configuration

### Editor Configuration Object

The editor accepts a comprehensive configuration object inspired by CKEditor:

```typescript
import type { EditorConfig } from 'erix';

const config: EditorConfig = {
  // Plugin configuration
  plugins: {
    // Built-in plugins to enable ('all', 'none', or array of IDs)
    builtin: ['bold', 'italic', 'underline', 'bullet-list', 'ordered-list', 'undo', 'redo'],

    // Built-in plugins to disable
    disabled: ['strikethrough'],

    // Custom plugins to register
    custom: [
      {
        id: 'insert-date',
        label: 'Insert Date',
        icon: 'calendar',
        group: 'insert',
        execute: ctx => {
          console.log('Inserting date...');
          return true;
        },
      },
    ],
  },

  // Toolbar configuration
  toolbar: {
    items: [
      'undo',
      'redo',
      '|', // Separator
      'bold',
      'italic',
      'underline',
      '|',
      'bullet-list',
      'ordered-list',
      '|',
      'align-left',
      'align-center',
      'align-right',
    ],
    visible: true,
    sticky: false,
  },

  // Initial content
  content: '<p>Start editing...</p>',
  contentFormat: 'html',

  // Other options
  placeholder: 'Type something...',
  readonly: false,
  theme: 'light',
  language: 'en',
};
```

### Using Configuration

**HTML Attributes:**

```html
<erix-editor theme="light" placeholder="Start typing..." readonly="false"></erix-editor>
```

**JavaScript Configuration:**

```javascript
const editor = document.querySelector('erix-editor');

// Set configuration before initialization
editor.config = {
  plugins: {
    builtin: ['bold', 'italic', 'undo', 'redo'],
    custom: [myCustomPlugin],
  },
};

// Or use shorthand props
editor.plugins = [myCustomPlugin];
editor.disabledPlugins = ['strikethrough'];
```

---

## Plugin System

### Built-in Plugins

| Plugin ID       | Group      | Label           | Shortcut    |
| --------------- | ---------- | --------------- | ----------- |
| `bold`          | formatting | Bold            | Mod+B       |
| `italic`        | formatting | Italic          | Mod+I       |
| `underline`     | formatting | Underline       | Mod+U       |
| `strikethrough` | formatting | Strikethrough   | Mod+Shift+S |
| `superscript`   | formatting | Superscript     | -           |
| `subscript`     | formatting | Subscript       | -           |
| `bullet-list`   | lists      | Bullet List     | -           |
| `ordered-list`  | lists      | Ordered List    | -           |
| `indent`        | lists      | Increase Indent | Tab         |
| `outdent`       | lists      | Decrease Indent | Shift+Tab   |
| `align-left`    | alignment  | Align Left      | -           |
| `align-center`  | alignment  | Align Center    | -           |
| `align-right`   | alignment  | Align Right     | -           |
| `align-justify` | alignment  | Justify         | -           |
| `undo`          | history    | Undo            | Mod+Z       |
| `redo`          | history    | Redo            | Mod+Shift+Z |

### Creating Custom Plugins

```typescript
import type { ErixPluginConfig, PluginContext } from 'erix';

const insertTimestampPlugin: ErixPluginConfig = {
  // Required
  id: 'insert-timestamp',
  label: 'Insert Timestamp',
  execute: (ctx: PluginContext) => {
    const timestamp = new Date().toLocaleString();
    console.log('Inserting:', timestamp);
    return true;
  },

  // Optional
  description: 'Inserts the current date and time',
  icon: 'clock',
  group: 'insert', // 'formatting' | 'alignment' | 'lists' | 'insert' | 'media' | 'table' | 'history' | 'tools' | 'custom'
  priority: 10, // Lower = appears first in group
  shortcut: 'Mod+Shift+T', // Keyboard shortcut
  showInToolbar: true, // Show in toolbar

  // State functions
  isActive: ctx => false, // Is plugin state "on"? (for toggles)
  canExecute: ctx => !ctx.selection.isEmpty, // Can plugin run?

  // Dependencies
  requires: ['other-plugin-id'], // Required plugins

  // Lifecycle hooks
  onInit: () => console.log('Plugin initialized'),
  onDestroy: () => console.log('Plugin destroyed'),

  // Toolbar config
  toolbar: {
    showInToolbar: true,
    showInBubble: false,
    position: 'end',
    separator: true,
  },

  // Custom metadata
  meta: {
    version: '1.0.0',
    author: 'Your Name',
  },
};
```

### Plugin Context

The `execute`, `isActive`, and `canExecute` functions receive a context object:

```typescript
interface PluginContext {
  // Current selection
  selection: {
    from: number;
    to: number;
    isEmpty: boolean;
    selectedText: string;
  };

  // Active formatting marks
  activeMarks: string[];

  // Invoke another plugin
  invokePlugin: (id: string) => boolean;

  // Check if a plugin is active
  isPluginActive: (id: string) => boolean;

  // Get content
  getHTML: () => string;
  getText: () => string;
}
```

### Registering Plugins

```typescript
// Single plugin
api.registerPlugin(insertTimestampPlugin);

// Multiple plugins
api.registerPlugins([plugin1, plugin2, plugin3]);

// Unregister
api.unregisterPlugin('insert-timestamp');
```

### Plugin Management

```typescript
// Enable/disable
api.enablePlugin('bold');
api.disablePlugin('strikethrough');
api.setPluginEnabled('italic', true);

// Query plugins
const allPlugins = api.getPlugins();
const formattingPlugins = api.getPluginsByGroup('formatting');
const toolbarPlugins = api.getPlugins({ showInToolbar: true });
const customPlugins = api.getPlugins({ isBuiltin: false });

// Check state
const isBoldActive = api.isPluginActive('bold');
const canUndo = api.canExecutePlugin('undo');

// Invoke
api.invokePlugin('bold');

// Export/Import configuration
const config = api.exportPluginConfig();
// Save to localStorage...
api.importPluginConfig(config);
```

---

## Vanilla JavaScript

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Erix Editor</title>
    <script type="module" src="node_modules/erix/dist/erix/erix.esm.js"></script>
    <style>
      .toolbar {
        margin-bottom: 10px;
      }
      .toolbar button {
        margin-right: 5px;
      }
      .toolbar button.active {
        background: #007bff;
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <button id="btn-bold">Bold</button>
      <button id="btn-italic">Italic</button>
      <button id="btn-undo">Undo</button>
      <button id="btn-redo">Redo</button>
      <button id="btn-save">Save</button>
    </div>

    <erix-editor id="editor" theme="light"></erix-editor>

    <script type="module">
      const editor = document.querySelector('#editor');
      let api = null;

      // Wait for editor ready
      editor.addEventListener('erix-ready', e => {
        api = e.detail.api;

        // Set initial content
        api.setContent('<p>Welcome to <strong>Erix Editor</strong>!</p>', 'html');

        // Listen for changes
        api.on('change', ({ content }) => {
          console.log('Content changed:', content.html);
        });

        // Update toolbar state on selection change
        api.on('selectionChange', updateToolbar);
      });

      function updateToolbar() {
        document.querySelector('#btn-bold').classList.toggle('active', api.isPluginActive('bold'));
        document.querySelector('#btn-italic').classList.toggle('active', api.isPluginActive('italic'));
        document.querySelector('#btn-undo').disabled = !api.canUndo();
        document.querySelector('#btn-redo').disabled = !api.canRedo();
      }

      // Button handlers
      document.querySelector('#btn-bold').onclick = () => api?.invokePlugin('bold');
      document.querySelector('#btn-italic').onclick = () => api?.invokePlugin('italic');
      document.querySelector('#btn-undo').onclick = () => api?.undo();
      document.querySelector('#btn-redo').onclick = () => api?.redo();
      document.querySelector('#btn-save').onclick = () => {
        const content = api?.getContent('json');
        console.log('Saving:', content);
        localStorage.setItem('editor-content', JSON.stringify(content));
      };
    </script>
  </body>
</html>
```

---

## React

### Wrapper Component

```tsx
// components/ErixEditor.tsx
import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import type { ErixEditorAPI, EditorContent, EditorConfig, ErixPluginConfig } from 'erix';
import { defineCustomElements } from 'erix/loader';

// Register custom elements
if (typeof window !== 'undefined') {
  defineCustomElements(window);
}

export interface ErixEditorRef {
  getAPI: () => Promise<ErixEditorAPI>;
  api: ErixEditorAPI | null;
}

interface ErixEditorProps {
  theme?: 'light' | 'dark';
  placeholder?: string;
  initialContent?: string;
  readonly?: boolean;
  config?: EditorConfig;
  plugins?: ErixPluginConfig[];
  disabledPlugins?: string[];
  onChange?: (content: EditorContent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onReady?: (api: ErixEditorAPI) => void;
}

export const ErixEditor = forwardRef<ErixEditorRef, ErixEditorProps>(
  ({ theme = 'light', placeholder, initialContent, readonly, config, plugins, disabledPlugins, onChange, onFocus, onBlur, onReady }, ref) => {
    const editorRef = useRef<HTMLElement>(null);
    const [api, setApi] = useState<ErixEditorAPI | null>(null);

    useImperativeHandle(ref, () => ({
      getAPI: async () => {
        if (api) return api;
        const el = editorRef.current as any;
        return el?.getAPI();
      },
      api,
    }));

    useEffect(() => {
      const el = editorRef.current as any;
      if (!el) return;

      // Set configuration
      if (config) el.config = config;
      if (plugins) el.plugins = plugins;
      if (disabledPlugins) el.disabledPlugins = disabledPlugins;

      const handleReady = (event: CustomEvent<{ api: ErixEditorAPI }>) => {
        const editorApi = event.detail.api;
        setApi(editorApi);

        if (initialContent) {
          editorApi.setContent(initialContent, 'html');
        }

        if (onChange) editorApi.on('change', ({ content }) => onChange(content));
        if (onFocus) editorApi.on('focus', onFocus);
        if (onBlur) editorApi.on('blur', onBlur);

        onReady?.(editorApi);
      };

      el.addEventListener('erix-ready', handleReady);
      return () => {
        el.removeEventListener('erix-ready', handleReady);
        api?.destroy();
      };
    }, []);

    return <erix-editor ref={editorRef as any} theme={theme} placeholder={placeholder} readonly={readonly} />;
  },
);
```

### Usage with Custom Toolbar

```tsx
import { useRef, useState, useCallback } from 'react';
import { ErixEditor, ErixEditorRef } from './components/ErixEditor';
import type { EditorContent, ErixPluginConfig } from 'erix';

// Custom plugin
const insertDatePlugin: ErixPluginConfig = {
  id: 'insert-date',
  label: 'Insert Date',
  icon: 'calendar',
  group: 'insert',
  execute: () => {
    console.log('Insert date:', new Date().toLocaleDateString());
    return true;
  },
};

function App() {
  const editorRef = useRef<ErixEditorRef>(null);
  const [isBold, setIsBold] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateToolbar = useCallback(() => {
    const api = editorRef.current?.api;
    if (api) {
      setIsBold(api.isPluginActive('bold'));
      setCanUndo(api.canUndo());
      setCanRedo(api.canRedo());
    }
  }, []);

  const handleReady = useCallback(api => {
    api.on('selectionChange', updateToolbar);
    api.on('change', updateToolbar);
  }, []);

  const handleCommand = useCallback((cmd: string) => {
    editorRef.current?.api?.invokePlugin(cmd);
    updateToolbar();
  }, []);

  return (
    <div>
      <div className="toolbar">
        <button className={isBold ? 'active' : ''} onClick={() => handleCommand('bold')}>
          Bold
        </button>
        <button disabled={!canUndo} onClick={() => handleCommand('undo')}>
          Undo
        </button>
        <button disabled={!canRedo} onClick={() => handleCommand('redo')}>
          Redo
        </button>
        <button onClick={() => handleCommand('insert-date')}>Insert Date</button>
      </div>

      <ErixEditor
        ref={editorRef}
        theme="light"
        plugins={[insertDatePlugin]}
        config={{
          plugins: {
            builtin: ['bold', 'italic', 'underline', 'undo', 'redo'],
          },
        }}
        onReady={handleReady}
        onChange={content => console.log('Changed:', content.html)}
      />
    </div>
  );
}
```

---

## Angular

### Module Setup

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { defineCustomElements } from 'erix/loader';

defineCustomElements(window);

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Editor Service

```typescript
// services/editor.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { ErixEditorAPI, EditorContent, ErixPluginConfig } from 'erix';

@Injectable({ providedIn: 'root' })
export class EditorService {
  private api: ErixEditorAPI | null = null;
  private content$ = new BehaviorSubject<EditorContent | null>(null);
  private ready$ = new BehaviorSubject<boolean>(false);

  get content(): Observable<EditorContent | null> {
    return this.content$.asObservable();
  }

  get isReady(): Observable<boolean> {
    return this.ready$.asObservable();
  }

  initialize(api: ErixEditorAPI): void {
    this.api = api;
    this.ready$.next(true);

    api.on('change', ({ content }) => {
      this.content$.next(content);
    });
  }

  setContent(html: string): void {
    this.api?.setContent(html, 'html');
  }

  getContent(): EditorContent | undefined {
    return this.api?.getContent();
  }

  invokePlugin(id: string): boolean {
    return this.api?.invokePlugin(id) ?? false;
  }

  registerPlugin(config: ErixPluginConfig): void {
    this.api?.registerPlugin(config);
  }

  isPluginActive(id: string): boolean {
    return this.api?.isPluginActive(id) ?? false;
  }

  canUndo(): boolean {
    return this.api?.canUndo() ?? false;
  }

  canRedo(): boolean {
    return this.api?.canRedo() ?? false;
  }
}
```

### Component

```typescript
// components/editor.component.ts
import { Component, OnDestroy } from '@angular/core';
import { EditorService } from '../services/editor.service';
import type { ErixEditorAPI, ErixPluginConfig } from 'erix';

@Component({
  selector: 'app-editor',
  template: `
    <div class="editor-container">
      <div class="toolbar">
        <button (click)="toggleBold()" [class.active]="isBold">Bold</button>
        <button (click)="toggleItalic()" [class.active]="isItalic">Italic</button>
        <button (click)="undo()" [disabled]="!canUndo">Undo</button>
        <button (click)="redo()" [disabled]="!canRedo">Redo</button>
      </div>

      <erix-editor [attr.theme]="theme" (erix-ready)="onEditorReady($event)"></erix-editor>
    </div>
  `,
})
export class EditorComponent implements OnDestroy {
  theme = 'light';
  isBold = false;
  isItalic = false;
  canUndo = false;
  canRedo = false;

  private api: ErixEditorAPI | null = null;

  constructor(private editorService: EditorService) {}

  onEditorReady(event: CustomEvent<{ api: ErixEditorAPI }>): void {
    this.api = event.detail.api;
    this.editorService.initialize(this.api);

    // Register custom plugin
    this.api.registerPlugin(this.createCustomPlugin());

    // Set initial content
    this.api.setContent('<p>Hello Angular!</p>', 'html');

    // Subscribe to selection changes
    this.api.on('selectionChange', () => this.updateToolbar());
    this.api.on('change', () => this.updateToolbar());
  }

  private createCustomPlugin(): ErixPluginConfig {
    return {
      id: 'angular-custom',
      label: 'Angular Custom',
      execute: () => {
        console.log('Angular custom plugin executed');
        return true;
      },
    };
  }

  private updateToolbar(): void {
    if (!this.api) return;
    this.isBold = this.api.isPluginActive('bold');
    this.isItalic = this.api.isPluginActive('italic');
    this.canUndo = this.api.canUndo();
    this.canRedo = this.api.canRedo();
  }

  toggleBold(): void {
    this.api?.invokePlugin('bold');
  }

  toggleItalic(): void {
    this.api?.invokePlugin('italic');
  }

  undo(): void {
    this.api?.undo();
  }

  redo(): void {
    this.api?.redo();
  }

  ngOnDestroy(): void {
    this.api?.destroy();
  }
}
```

---

## Vue.js

### Composable

```typescript
// composables/useErixEditor.ts
import { ref, onMounted, onUnmounted, Ref } from 'vue';
import type { ErixEditorAPI, EditorContent, ErixPluginConfig } from 'erix';

export function useErixEditor() {
  const editorRef = ref<HTMLElement | null>(null);
  const api = ref<ErixEditorAPI | null>(null);
  const content = ref<EditorContent | null>(null);
  const isReady = ref(false);
  const activeMarks = ref<string[]>([]);

  const setContent = (html: string) => {
    api.value?.setContent(html, 'html');
  };

  const getContent = () => {
    return api.value?.getContent();
  };

  const invokePlugin = (id: string) => {
    return api.value?.invokePlugin(id) ?? false;
  };

  const registerPlugin = (config: ErixPluginConfig) => {
    api.value?.registerPlugin(config);
  };

  const isPluginActive = (id: string) => {
    return api.value?.isPluginActive(id) ?? false;
  };

  onMounted(() => {
    const el = editorRef.value;
    if (!el) return;

    const handleReady = (event: CustomEvent<{ api: ErixEditorAPI }>) => {
      api.value = event.detail.api;
      isReady.value = true;

      api.value.on('change', ({ content: c }) => {
        content.value = c;
      });

      api.value.on('selectionChange', () => {
        activeMarks.value = api.value?.getState().activeMarks ?? [];
      });
    };

    el.addEventListener('erix-ready', handleReady as EventListener);
  });

  onUnmounted(() => {
    api.value?.destroy();
  });

  return {
    editorRef,
    api,
    content,
    isReady,
    activeMarks,
    setContent,
    getContent,
    invokePlugin,
    registerPlugin,
    isPluginActive,
  };
}
```

### Component

```vue
<!-- components/RichEditor.vue -->
<template>
  <div class="rich-editor">
    <div class="toolbar">
      <button v-for="btn in toolbarButtons" :key="btn.id" :class="{ active: isActive(btn.id) }" :disabled="!canExecute(btn.id)" @click="invoke(btn.id)">
        {{ btn.label }}
      </button>
    </div>

    <erix-editor ref="editorRef" :theme="theme" :placeholder="placeholder" @erix-ready="onReady" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useErixEditor } from '../composables/useErixEditor';
import type { ErixPluginConfig } from 'erix';

const props = withDefaults(
  defineProps<{
    theme?: 'light' | 'dark';
    placeholder?: string;
    initialContent?: string;
  }>(),
  {
    theme: 'light',
    placeholder: 'Start typing...',
  },
);

const emit = defineEmits<{
  ready: [api: any];
  change: [content: any];
}>();

const { editorRef, api, isReady, invokePlugin, isPluginActive } = useErixEditor();

const toolbarButtons = [
  { id: 'undo', label: 'Undo' },
  { id: 'redo', label: 'Redo' },
  { id: 'bold', label: 'Bold' },
  { id: 'italic', label: 'Italic' },
  { id: 'underline', label: 'Underline' },
  { id: 'bullet-list', label: 'Bullet List' },
  { id: 'ordered-list', label: 'Numbered List' },
];

const isActive = (id: string) => isPluginActive(id);
const canExecute = (id: string) => api.value?.canExecutePlugin(id) ?? false;
const invoke = (id: string) => invokePlugin(id);

function onReady(event: CustomEvent) {
  const editorApi = event.detail.api;

  // Set initial content
  if (props.initialContent) {
    editorApi.setContent(props.initialContent, 'html');
  }

  // Register custom plugin
  editorApi.registerPlugin({
    id: 'vue-custom',
    label: 'Vue Custom',
    execute: () => {
      console.log('Vue custom plugin executed');
      return true;
    },
  });

  // Listen for changes
  editorApi.on('change', ({ content }) => {
    emit('change', content);
  });

  emit('ready', editorApi);
}

defineExpose({
  getAPI: () => api.value,
});
</script>

<style scoped>
.toolbar button.active {
  background: #007bff;
  color: white;
}
</style>
```

---

## API Reference

### Content Methods

| Method                        | Description     | Returns              |
| ----------------------------- | --------------- | -------------------- |
| `getContent()`                | Get all formats | `EditorContent`      |
| `getContent('html')`          | Get HTML        | `string`             |
| `getContent('json')`          | Get JSON        | `EditorDocumentJSON` |
| `getContent('text')`          | Get plain text  | `string`             |
| `setContent(content, format)` | Set content     | `void`               |
| `clearContent()`              | Clear content   | `void`               |
| `isEmpty()`                   | Check if empty  | `boolean`            |

### Plugin Methods

| Method                       | Description         | Returns                         |
| ---------------------------- | ------------------- | ------------------------------- |
| `registerPlugin(config)`     | Register plugin     | `void`                          |
| `registerPlugins(configs)`   | Register multiple   | `void`                          |
| `unregisterPlugin(id)`       | Remove plugin       | `boolean`                       |
| `invokePlugin(id)`           | Execute plugin      | `boolean`                       |
| `getPlugins(options?)`       | Get all plugins     | `RegisteredPlugin[]`            |
| `getPluginsByGroup(group)`   | Get by group        | `RegisteredPlugin[]`            |
| `getPlugin(id)`              | Get single plugin   | `RegisteredPlugin \| undefined` |
| `enablePlugin(id)`           | Enable plugin       | `void`                          |
| `disablePlugin(id)`          | Disable plugin      | `void`                          |
| `isPluginActive(id)`         | Check if active     | `boolean`                       |
| `canExecutePlugin(id)`       | Check if executable | `boolean`                       |
| `exportPluginConfig()`       | Export config       | `PluginConfig[]`                |
| `importPluginConfig(config)` | Import config       | `void`                          |

### History Methods

| Method      | Description       | Returns   |
| ----------- | ----------------- | --------- |
| `undo()`    | Undo last action  | `boolean` |
| `redo()`    | Redo last action  | `boolean` |
| `canUndo()` | Check if can undo | `boolean` |
| `canRedo()` | Check if can redo | `boolean` |

### Focus Methods

| Method       | Description      | Returns   |
| ------------ | ---------------- | --------- |
| `focus()`    | Focus editor     | `void`    |
| `blur()`     | Remove focus     | `void`    |
| `hasFocus()` | Check if focused | `boolean` |

### Selection Methods

| Method                    | Description   | Returns           |
| ------------------------- | ------------- | ----------------- |
| `getSelection()`          | Get selection | `EditorSelection` |
| `setSelection(from, to?)` | Set selection | `void`            |
| `selectAll()`             | Select all    | `void`            |

---

## Events

| Event             | Payload                          | Description        |
| ----------------- | -------------------------------- | ------------------ |
| `change`          | `{ content: EditorContent }`     | Content changed    |
| `selectionChange` | `{ selection: EditorSelection }` | Selection changed  |
| `focus`           | `undefined`                      | Editor focused     |
| `blur`            | `undefined`                      | Editor blurred     |
| `ready`           | `undefined`                      | Editor initialized |
| `destroy`         | `undefined`                      | Editor destroyed   |

---

## TypeScript Support

```typescript
import type {
  // API
  ErixEditorAPI,

  // Content
  ContentFormat,
  EditorContent,
  EditorDocumentJSON,

  // Selection & State
  EditorSelection,
  EditorStateSnapshot,

  // Events
  EditorEventType,
  EditorEventPayload,
  EditorEventListener,

  // Plugins
  PluginId,
  PluginGroup,
  PluginContext,
  ErixPluginConfig,
  RegisteredPlugin,
  PluginQueryOptions,

  // Configuration
  EditorConfig,
  PluginsConfig,
  ToolbarConfig,
} from 'erix';

// Constants
import { DEFAULT_EDITOR_CONFIG, DEFAULT_PLUGINS, ALL_BUILTIN_PLUGINS } from 'erix';
```

---

## License

MIT
