# erix-toolbar



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                             | Type         | Default     |
| -------- | --------- | --------------------------------------- | ------------ | ----------- |
| `theme`  | `theme`   | Current theme                           | `string`     | `'light'`   |
| `view`   | --        | Reference to the ProseMirror EditorView | `EditorView` | `undefined` |


## Events

| Event         | Description                                  | Type                |
| ------------- | -------------------------------------------- | ------------------- |
| `themeToggle` | Event emitted when theme toggle is requested | `CustomEvent<void>` |


## Methods

### `updateActiveFormats() => Promise<void>`

Call this method from the parent to refresh the toolbar state

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [erix-editor](../erix-editor)

### Depends on

- [erix-button](../ui/erix-button)
- [erix-icon](../ui/erix-icon)
- [erix-divider](../ui/erix-divider)

### Graph
```mermaid
graph TD;
  erix-toolbar --> erix-button
  erix-toolbar --> erix-icon
  erix-toolbar --> erix-divider
  erix-editor --> erix-toolbar
  style erix-toolbar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
