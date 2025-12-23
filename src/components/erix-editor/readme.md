# erix-editor

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                            | Type     | Default             |
| ------------- | ------------- | -------------------------------------- | -------- | ------------------- |
| `placeholder` | `placeholder` | Placeholder text when editor is empty. | `string` | `'Start typing...'` |
| `theme`       | `theme`       | The editor theme.                      | `string` | `'light'`           |


## Dependencies

### Depends on

- [erix-toolbar](../toolbar)

### Graph
```mermaid
graph TD;
  erix-editor --> erix-toolbar
  erix-toolbar --> erix-button
  erix-toolbar --> erix-icon
  erix-toolbar --> erix-divider
  style erix-editor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
