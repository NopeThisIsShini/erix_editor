import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Erix Editor Angular Demo';
  charCount = 0;
  private editorApi: any = null;

  // Editor configuration
  editorConfig = {
    toolbar: {
      items: [
        'undo', 'redo',
        'bold', 'italic', 'underline', 'strikethrough',
        'bullet-list', 'ordered-list',
        'font-family', 'font-size'
      ]
    },
    theme: 'light',
    placeholder: 'Start typing your content here...'
  };

  onEditorReady(event: any) {
    this.editorApi = event.detail.api;
    console.log('Erix Editor is ready!', this.editorApi);
    
    // Set initial content
    this.editorApi.setContent('<p>Hello from <strong>Angular</strong>! 🎉</p>', 'html');
  }

  onContentChange(event: any) {
    const { content } = event.detail;
    this.charCount = content.text.length;
  }
}
