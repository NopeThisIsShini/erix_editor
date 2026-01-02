# erix-icon

A semantic icon component for the editor. Renders SVG icons based on the icon name.

<!-- Auto Generated Below -->

## Properties

| Property            | Attribute | Description                                       | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Default     |
| ------------------- | --------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `name` _(required)_ | `name`    | The name of the semantic editor icon              | `"print" \| "undo" \| "redo" \| "importFromWord" \| "pageBreak" \| "formatBold" \| "formatHeading" \| "formatItalic" \| "formatUnderline" \| "formatStrikethrough" \| "bulletList" \| "numberList" \| "lightMode" \| "darkMode" \| "textAlignJustify" \| "textAlignLeft" \| "textAlignRight" \| "textAlignCenter" \| "textLineSpacing" \| "superScript" \| "subScript" \| "upperCase" \| "lowerCase" \| "table" \| "tableAddRowBefore" \| "tableAddRowAfter" \| "tableAddColumnBefore" \| "tableAddColumnAfter" \| "tableDeleteRow" \| "tableDeleteColumn" \| "tableMergeCells" \| "tableSplitCell" \| "tableDelete"` | `undefined` |
| `size`              | `size`    | The size of the icon in pixels (width and height) | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `20`        |

## Dependencies

### Used by

- [erix-table-toolbar](../table-toolbar)
- [erix-toolbar](../../toolbar)

### Graph

```mermaid
graph TD;
  erix-table-toolbar --> erix-icon
  erix-toolbar --> erix-icon
  style erix-icon fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
