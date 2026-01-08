import { Component, Host, h, Prop, State, Element, Watch, Method } from '@stencil/core';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { editorSchema, createEditorPlugins } from '@src/core';
import { EditorController } from '@src/core/editor';
import { ErixEditorAPI } from '@src/api';
import type { EditorConfig, ErixPluginConfig } from '@src/api';

/**
 * @component ErixEditor
 * A rich text editor component with built-in toolbar and plugin system.
 */
@Component({
  tag: 'erix-editor',
  styleUrl: 'erix-editor.css',
  shadow: true,
})
export class ErixEditor {
  @Element() el!: HTMLElement;

  // ===========================================================================
  // PROPS
  // ===========================================================================

  @Prop({ reflect: true, mutable: true }) theme: 'light' | 'dark' | string = 'light';
  @Prop() placeholder: string = 'Start typing...';
  @Prop() content?: string;
  @Prop() readonly: boolean = false;
  @Prop() config?: EditorConfig;
  @Prop() plugins?: ErixPluginConfig[];
  @Prop() disabledPlugins?: string[];
  @Prop() defaultFontSize: string = '12pt';
  @Prop() defaultFontFamily: string = 'Arial, sans-serif';

  // ===========================================================================
  // STATE
  // ===========================================================================

  @State() private editorView?: EditorView;
  @State() private wordCount: number = 0;
  @State() private characterCount: number = 0;

  private _api?: ErixEditorAPI;
  private _controller?: EditorController;
  private editorContainer?: HTMLDivElement;
  private toolbarRef?: HTMLErixToolbarElement;

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  @Method()
  async getAPI(): Promise<ErixEditorAPI> {
    if (!this._api) {
      throw new Error('Editor not initialized. Wait for componentDidLoad.');
    }
    return this._api;
  }

  get api(): ErixEditorAPI {
    if (!this._api) {
      throw new Error('Editor not initialized. Use getAPI() or wait for componentDidLoad.');
    }
    return this._api;
  }

  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================

  componentDidLoad() {
    this.initializeEditor();
  }

  disconnectedCallback() {
    if (this._api) {
      this._api.destroy();
      this._api = undefined;
      this._controller = undefined;
      this.editorView = undefined;
    }
  }

  // ===========================================================================
  // WATCHERS
  // ===========================================================================

  @Watch('theme')
  onThemeChange() {}

  @Watch('content')
  onContentChange(newContent: string) {
    if (this._api && newContent !== undefined) {
      this._api.setContent(newContent, 'html');
    }
  }

  @Watch('readonly')
  onReadonlyChange(newValue: boolean) {
    if (this.editorView) {
      this.editorView.setProps({ editable: () => !newValue });
    }
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private updateCounts(state: EditorState) {
    let text = '';
    state.doc.descendants(node => {
      if (node.isText) {
        text += node.text;
      } else if (node.isBlock && text.length > 0 && !text.endsWith('\n')) {
        text += ' ';
      }
    });

    this.characterCount = text.replace(/\s+/g, ' ').trim().length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount = words.length;
  }

  private initializeEditor() {
    if (!this.editorContainer) return;

    const state = EditorState.create({
      schema: editorSchema,
      plugins: createEditorPlugins({ placeholder: this.placeholder }),
    });

    this.editorView = new EditorView(this.editorContainer, {
      state,
      editable: () => !this.readonly,
      dispatchTransaction: tr => {
        if (!this.editorView) return;

        const newState = this.editorView.state.apply(tr);
        this.editorView.updateState(newState);

        if (this._controller) {
          this._controller.notifyTransactionListeners(tr, newState);
        }

        if (this.toolbarRef) {
          this.toolbarRef.updateActiveFormats();
        }

        this.updateCounts(newState);
      },
    });

    const editorConfig = this.buildConfig();
    this._controller = new EditorController(this.editorView);
    this._api = new ErixEditorAPI(this._controller, editorConfig);

    if (this.content) {
      this._api.setContent(this.content, 'html');
    }

    this._api.on('change', ({ content }) => {
      this.el.dispatchEvent(new CustomEvent('erix-content-change', { bubbles: true, composed: true, detail: { content } }));
    });

    this._api.on('selectionChange', ({ selection }) => {
      this.el.dispatchEvent(new CustomEvent('erix-selection-change', { bubbles: true, composed: true, detail: { selection } }));
    });

    this._api.on('focus', () => {
      this.el.dispatchEvent(new CustomEvent('erix-focus', { bubbles: true, composed: true }));
    });

    this._api.on('blur', () => {
      this.el.dispatchEvent(new CustomEvent('erix-blur', { bubbles: true, composed: true }));
    });

    this.el.dispatchEvent(new CustomEvent('erix-ready', { bubbles: true, composed: true, detail: { api: this._api } }));
  }

  private buildConfig(): EditorConfig {
    const config: EditorConfig = {
      ...this.config,
      theme: this.theme as 'light' | 'dark',
      placeholder: this.placeholder,
      readonly: this.readonly,
      defaultFontSize: this.defaultFontSize,
      defaultFontFamily: this.defaultFontFamily,
    };

    if (this.plugins || this.disabledPlugins) {
      config.plugins = {
        ...config.plugins,
        custom: [...(config.plugins?.custom || []), ...(this.plugins || [])],
        disabled: [...(config.plugins?.disabled || []), ...(this.disabledPlugins || [])],
      };
    }

    return config;
  }

  private handleThemeToggle = () => {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  };

  render() {
    return (
      <Host 
        data-theme={this.theme}
        style={{
          '--editor-default-size': this.defaultFontSize,
          '--editor-default-font': this.defaultFontFamily,
        }}
      >
        <div class="editor-wrapper">
          <erix-toolbar
            ref={el => (this.toolbarRef = el)}
            view={this.editorView}
            theme={this.theme}
            items={this.config?.toolbar?.items || [
              'undo', 'redo', '|', 'font-family', 'font-size', '|',
              'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', '|',
              'uppercase', 'lowercase', '|', 'align-left', 'align-center', 'align-right', 'align-justify', '|',
              'bullet-list', 'ordered-list', '|', 'table', '|', 'page-break', 'print', 'import-word'
            ]}
            showThemeToggle={false}
          ></erix-toolbar>

          <div class="editor-content">
            <div class="editor-canvas" ref={el => (this.editorContainer = el)}></div>
          </div>

          <erix-status-bar
            theme={this.theme}
            wordCount={this.wordCount}
            characterCount={this.characterCount}
            onThemeToggle={this.handleThemeToggle}
          ></erix-status-bar>
        </div>
      </Host>
    );
  }
}
