<script setup>
import { ref } from 'vue';

const editorConfig = {
  toolbar: {
    items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list'],
  },
  theme: 'light',
  placeholder: 'Start typing...',
};

function handleReady(event) {
  const api = event.detail.api;
  api.setContent('<p>Hello Vue!</p>', 'html');
}

function handleContentChange(event) {
  console.log('Content changed:', event.detail.content);
}
</script>

<template>
  <div class="editor-container">
    <h1>Erix Editor + Vue</h1>
    <erix-editor :config="editorConfig" @erix-ready="handleReady" @erix-content-change="handleContentChange"></erix-editor>
  </div>
</template>

<style>
.editor-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
</style>
