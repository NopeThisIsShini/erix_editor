# erix-editor

The main rich text editor component with built-in toolbar, status bar, and plugin system.

<!-- Auto Generated Below -->


## Properties

| Property          | Attribute     | Description | Type                 | Default             |
| ----------------- | ------------- | ----------- | -------------------- | ------------------- |
| `config`          | --            |             | `EditorConfig`       | `undefined`         |
| `content`         | `content`     |             | `string`             | `undefined`         |
| `disabledPlugins` | --            |             | `string[]`           | `undefined`         |
| `placeholder`     | `placeholder` |             | `string`             | `'Start typing...'` |
| `plugins`         | --            |             | `ErixPluginConfig[]` | `undefined`         |
| `readonly`        | `readonly`    |             | `boolean`            | `false`             |
| `theme`           | `theme`       |             | `string`             | `'light'`           |


## Methods

### `getAPI() => Promise<ErixEditorAPI>`



#### Returns

Type: `Promise<ErixEditorAPI>`




## Dependencies

### Depends on

- [erix-toolbar](../toolbar)
- [erix-status-bar](../ui/erix-status-bar)

### Graph
```mermaid
graph TD;
  erix-editor --> erix-toolbar
  erix-editor --> erix-status-bar
  erix-toolbar --> erix-button
  erix-toolbar --> erix-icon
  erix-toolbar --> erix-select
  erix-toolbar --> erix-dropdown
  erix-toolbar --> erix-table-picker
  erix-toolbar --> erix-divider
  erix-select --> erix-icon
  style erix-editor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
