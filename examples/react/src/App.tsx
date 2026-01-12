import { defineCustomElements } from 'erixeditor/loader';
import './App.css';

// Register Stencil custom elements once
defineCustomElements();

function App() {
  const handleReady = (event: CustomEvent) => {
    const api = event.detail.api;
    api.setContent('<p>Hello React with Erix Editor!</p>', 'html');
  };

  const handleContentChange = (event: CustomEvent) => {
    console.log('Content changed:', event.detail.content);
  };

  return (
    <div className="editor-demo">
      <h1>Erix Editor – React Demo</h1>
      <p>Testing the Stencil web component integration with React</p>

      <div className="editor-container">
        <erix-editor
          id="demo-editor"
          onerix-ready={handleReady}
          onerix-content-change={handleContentChange}
        />
      </div>
    </div>
  );
}

export default App;
