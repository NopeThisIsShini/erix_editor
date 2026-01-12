import { defineCustomElements } from 'erixeditor/loader';

// Define custom elements
defineCustomElements();
import './App.css'

function App() {
  
const handleReady = (event: any) => {
    const api = event.detail.api;
    api.setContent('<p>Hello React with Custom Loader!</p>', 'html');
  };

  const handleContentChange = (event: any) => {
    console.log('Content changed:', event.detail.content);
  };

  return (
    <>
  <erix-editor
      config={{
        toolbar: {
          items: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullet-list'],
        },
        theme: 'light',
      }}
      onerix-ready={handleReady}
      onerix-content-change={handleContentChange}
    />
    </>
  )
}

export default App
