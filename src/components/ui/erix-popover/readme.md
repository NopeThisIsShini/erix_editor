# erix-popover

A smart popover component with auto-positioning. Appends content to body for proper positioning and automatically flips position when there's not enough space.

<!-- Auto Generated Below -->

## Properties

| Property     | Attribute   | Description                                        | Type                                                                                                                                                                 | Default     |
| ------------ | ----------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `anchorRect` | --          | Anchor element or bounding rect to position to     | `DOMRect`                                                                                                                                                            | `undefined` |
| `autoFlip`   | `auto-flip` | Whether to auto-flip when there's not enough space | `boolean`                                                                                                                                                            | `true`      |
| `offset`     | `offset`    | Offset distance from the trigger (in pixels)       | `number`                                                                                                                                                             | `8`         |
| `open`       | `open`      | Whether the popover is visible                     | `boolean`                                                                                                                                                            | `false`     |
| `placement`  | `placement` | Preferred placement of the popover                 | `"top" \| "top-start" \| "top-end" \| "bottom" \| "bottom-start" \| "bottom-end" \| "left" \| "left-start" \| "left-end" \| "right" \| "right-start" \| "right-end"` | `'top'`     |

## Methods

### `hide() => Promise<void>`

Close the popover

#### Returns

Type: `Promise<void>`

### `show(anchorRect?: DOMRect) => Promise<void>`

Open the popover at a specific anchor rect

#### Returns

Type: `Promise<void>`

### `updatePosition() => Promise<void>`

Manually trigger a position update

#### Returns

Type: `Promise<void>`

---

_Built with [StencilJS](https://stenciljs.com/)_
