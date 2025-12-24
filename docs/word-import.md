# Word Document Import Feature

This document describes the Word document import functionality added to the Erix Editor.

## Overview

The Erix Editor now supports importing content from Microsoft Word documents (.docx files). This feature:

- Parses .docx files and extracts formatted content
- Preserves formatting like bold, italic, underline, strikethrough
- Handles headings (H1-H6)
- Supports lists (bullet and numbered)
- Maintains text alignment
- Extracts document metadata (title, author, etc.)

## Requirements

This feature requires the **JSZip** library for parsing .docx files (which are ZIP archives containing XML):

```bash
npm install jszip
```

## Usage

### Method 1: Using the API directly

```typescript
// Get the editor instance
const editor = document.querySelector('erix-editor');
const api = await editor.getAPI();

// Option A: Open a file picker dialog
const result = await api.openWordImportDialog();
if (result) {
  console.log('Imported document:', result.metadata.title);
  console.log('HTML content:', result.html);
}

// Option B: Import from an existing File
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const result = await api.importFromWordFile(file);
    console.log('Imported:', result);
  }
});

// Option C: Parse without setting content (for preview)
const parsedDoc = await api.parseWordDocument(file);
console.log('Preview:', parsedDoc.html);
// Later, set the content manually if desired
api.setContent(parsedDoc.html, 'html');
```

### Method 2: Using the Plugin System

```typescript
// Invoke the import-word plugin
editor.api.invokePlugin('import-word');

// Listen for the import event
document.addEventListener('erix-word-import', (event) => {
  const { result } = event.detail;
  console.log('Document imported:', result);
});
```

### Method 3: Toolbar Button

Add the import button to your toolbar configuration:

```typescript
const editorConfig = {
  toolbar: {
    items: [
      'undo', 'redo', '|',
      'bold', 'italic', 'underline', '|',
      'import-word', // Add this!
    ],
  },
};
```

### Method 4: Direct Import (Standalone Functions)

```typescript
import { parseWordDocument, openWordFileDialog, isValidWordDocument } from 'erix';

// Validate a file
if (isValidWordDocument(file)) {
  // Parse it
  const result = await parseWordDocument(file, {
    preserveStyles: true,
    preserveLists: true,
  });
  
  console.log(result.html);
  console.log(result.text);
  console.log(result.metadata);
}

// Or open a file dialog directly
const result = await openWordFileDialog();
```

## API Reference

### `ErixEditorAPI` Methods

#### `openWordImportDialog(options?)`
Opens a file picker dialog and imports the selected Word document.

**Parameters:**
- `options.preserveStyles` (boolean): Whether to preserve formatting (default: true)
- `options.preserveLists` (boolean): Whether to preserve lists (default: true)

**Returns:** `Promise<{ html, text, metadata } | null>`

#### `importFromWordFile(file, options?)`
Imports content from a Word document File or Blob.

**Parameters:**
- `file` (File | Blob): The .docx file
- `options`: Same as openWordImportDialog

**Returns:** `Promise<{ html, text, metadata }>`

#### `parseWordDocument(file, options?)`
Parses a Word document without setting it as editor content.

**Returns:** `Promise<{ html, text, metadata }>`

### Standalone Functions

#### `parseWordDocument(file, options?)`
Core parsing function.

#### `parseWordToNode(file, schema, options?)`
Returns a ProseMirror Node instead of HTML.

#### `isValidWordDocument(file)`
Validates if a file is a valid .docx file.

#### `openWordFileDialog(options?)`
Opens a file picker and returns the parsed result.

### Types

```typescript
interface WordImportOptions {
  preserveStyles?: boolean;
  preserveImages?: boolean;
  preserveLists?: boolean;
  preserveTables?: boolean;
  styleMapping?: Record<string, string>;
}

interface WordImportResult {
  html: string;
  text: string;
  metadata: WordDocumentMetadata;
  warnings: string[];
}

interface WordDocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  created?: Date;
  modified?: Date;
}
```

## Plugin Information

- **Plugin ID:** `import-word`
- **Group:** `tools`
- **Icon:** `import-word` (also available as `importFromWord`)
- **Default Visibility:** Not shown in toolbar (set `showInToolbar: true` in config to show)

## Notes

1. The importer handles basic formatting well but complex Word documents with embedded objects, macros, or advanced formatting may not import perfectly.

2. Images in Word documents are currently not extracted. This could be added in a future update.

3. The `jszip` library is loaded dynamically only when needed, so it won't affect your bundle size if Word import is not used.
