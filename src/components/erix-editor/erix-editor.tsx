import { Component, Host, h, Prop, State, Element, Watch } from '@stencil/core';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { editorSchema, editorPlugins } from '@src/core';

/**
 * @component ErixEditor
 * A rich text editor component with built-in toolbar.
 */
@Component({
  tag: 'erix-editor',
  styleUrl: 'erix-editor.css',
  shadow: true,
})
export class ErixEditor {
  @Element() el!: HTMLElement;

  /**
   * The editor theme.
   */
  @Prop({ reflect: true, mutable: true }) theme: 'light' | 'dark' | string = 'light';

  /**
   * Placeholder text when editor is empty.
   */
  @Prop() placeholder: string = 'Start typing...';

  /**
   * Internal state for the editor view (passed to toolbar)
   */
  @State() private editorView?: EditorView;

  private editorContainer?: HTMLDivElement;
  private toolbarRef?: HTMLErixToolbarElement;

  componentDidLoad() {
    this.initializeEditor();
  }

  disconnectedCallback() {
    if (this.editorView) {
      this.editorView.destroy();
      this.editorView = undefined;
    }
  }

  @Watch('theme')
  onThemeChange() {
    // Theme changes are handled by CSS variables
  }

  private initializeEditor() {
    if (!this.editorContainer) return;

    const state = EditorState.create({
      schema: editorSchema,
      plugins: editorPlugins,
    });

    this.editorView = new EditorView(this.editorContainer, {
      state,
      dispatchTransaction: (tr) => {
        if (!this.editorView) return;

        const newState = this.editorView.state.apply(tr);
        this.editorView.updateState(newState);
        
        // Update toolbar state
        if (this.toolbarRef) {
          this.toolbarRef.updateActiveFormats();
        }
      },
    });
  }

  private handleThemeToggle = () => {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  };

  render() {
    return (
      <Host data-theme={this.theme}>
        <div class="editor-wrapper">
          {/* Toolbar Component */}
          <erix-toolbar
            ref={(el) => (this.toolbarRef = el)}
            view={this.editorView}
            theme={this.theme}
            onThemeToggle={this.handleThemeToggle}
          ></erix-toolbar>

          {/* Editor Content Area */}
          <div class="editor-content">
            <div
              class="editor-canvas"
              ref={(el) => (this.editorContainer = el)}
            ></div>
          </div>
        </div>
      </Host>
    );
  }
}
