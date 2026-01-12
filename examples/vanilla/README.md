# Vanilla JavaScript Example

This example demonstrates how to use Erix Editor with plain HTML and JavaScript.

## Usage

### Option 1: CDN (Recommended for quick testing)

Simply open `index.html` in your browser. The editor loads from the unpkg CDN.

### Option 2: Local npm installation

1. Install the package:

   ```bash
   npm install erixeditor
   ```

2. Import in your project:
   ```html
   <script type="module">
     import 'erixeditor';
   </script>
   ```

## Features Demonstrated

- ✅ Full toolbar configuration
- ✅ Light theme
- ✅ Real-time character and word count
- ✅ Save/Load from localStorage
- ✅ Get HTML output
- ✅ Clear content

## Files

- `index.html` - Complete working example with styled UI

## Code Walkthrough

### 1. Include the Editor

```html
<script type="module" src="https://unpkg.com/erixeditor/dist/erixeditor/erixeditor.esm.js"></script>
```

### 2. Add the Editor Element

```html
<erix-editor id="editor"></erix-editor>
```

### 3. Configure the Editor

```javascript
const editor = document.querySelector('#editor');

editor.config = {
  toolbar: {
    items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list'],
  },
  theme: 'light',
  placeholder: 'Start typing...',
};
```

### 4. Listen for Events

```javascript
editor.addEventListener('erix-ready', e => {
  const api = e.detail.api;

  // Set content
  api.setContent('<p>Hello World!</p>', 'html');

  // Listen for changes
  api.on('change', ({ content }) => {
    console.log('Content changed:', content.html);
  });
});
```

## Learn More

See the full [Integration Guide](../../docs/INTEGRATION_GUIDE.md) for complete API documentation.
