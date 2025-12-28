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
 *
 * @example
 * ```html
 * <erix-editor theme="light" placeholder="Start typing..."></erix-editor>
 * ```
 *
 * @example
 * ```typescript
 * // Access the public API
 * const editor = document.querySelector('erix-editor');
 * const api = await editor.getAPI();
 *
 * // Configure plugins
 * editor.config = {
 *   plugins: {
 *     builtin: ['bold', 'italic', 'underline', 'undo', 'redo'],
 *     disabled: ['strikethrough'],
 *     custom: [myCustomPlugin]
 *   },
 *   toolbar: {
 *     items: ['undo', 'redo', '|', 'bold', 'italic', 'underline']
 *   }
 * };
 *
 * // Use the API
 * api.setContent('<p>Hello World</p>', 'html');
 * api.on('change', ({ content }) => console.log(content));
 *
 * // Register custom plugin
 * api.registerPlugin({
 *   id: 'my-plugin',
 *   label: 'My Plugin',
 *   execute: (ctx) => { console.log('Executed!'); return true; }
 * });
 * ```
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

  /**
   * The editor theme.
   */
  @Prop({ reflect: true, mutable: true }) theme: 'light' | 'dark' | string = 'light';

  /**
   * Placeholder text when editor is empty.
   */
  @Prop() placeholder: string = 'Start typing...';

  /**
   * Initial content (HTML string).
   */
  @Prop() content?: string;

  /**
   * Whether the editor is read-only.
   */
  @Prop() readonly: boolean = false;

  /**
   * Editor configuration object.
   * Use this to configure plugins, toolbar, and other settings.
   */
  @Prop() config?: EditorConfig;

  /**
   * Custom plugins to register.
   * Shorthand for config.plugins.custom
   */
  @Prop() plugins?: ErixPluginConfig[];

  /**
   * Disabled plugin IDs.
   * Shorthand for config.plugins.disabled
   */
  @Prop() disabledPlugins?: string[];

  // ===========================================================================
  // STATE
  // ===========================================================================

  /**
   * Internal state for the editor view (passed to toolbar)
   */
  @State() private editorView?: EditorView;

  /**
   * The public API instance.
   */
  private _api?: ErixEditorAPI;

  /**
   * The internal editor controller.
   */
  private _controller?: EditorController;

  private editorContainer?: HTMLDivElement;
  private toolbarRef?: HTMLErixToolbarElement;

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * Get the public API instance.
   * @returns The ErixEditorAPI instance
   */
  @Method()
  async getAPI(): Promise<ErixEditorAPI> {
    if (!this._api) {
      throw new Error('Editor not initialized. Wait for componentDidLoad.');
    }
    return this._api;
  }

  /**
   * Direct access to the API (synchronous).
   * Only available after component has loaded.
   */
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
    // Destroy the API (which will destroy the controller)
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
  onThemeChange() {
    // Theme changes are handled by CSS variables
  }

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

        // Notify controller of transaction
        if (this._controller) {
          this._controller.notifyTransactionListeners(tr, newState);
        }

        // Update toolbar state
        if (this.toolbarRef) {
          this.toolbarRef.updateActiveFormats();
        }
      },
    });

    // Build configuration
    const editorConfig = this.buildConfig();

    // Create the controller and API
    this._controller = new EditorController(this.editorView);
    this._api = new ErixEditorAPI(this._controller, editorConfig);

    // Set initial content if provided
    if (this.content) {
      this._api.setContent(this.content, 'html');
    }

    // Subscribe to content changes and emit DOM event
    this._api.on('change', ({ content }) => {
      this.el.dispatchEvent(
        new CustomEvent('erix-content-change', {
          bubbles: true,
          composed: true,
          detail: { content },
        })
      );
    });

    // Subscribe to selection changes and emit DOM event
    this._api.on('selectionChange', ({ selection }) => {
      this.el.dispatchEvent(
        new CustomEvent('erix-selection-change', {
          bubbles: true,
          composed: true,
          detail: { selection },
        })
      );
    });

    // Subscribe to focus/blur and emit DOM events
    this._api.on('focus', () => {
      this.el.dispatchEvent(
        new CustomEvent('erix-focus', {
          bubbles: true,
          composed: true,
        })
      );
    });

    this._api.on('blur', () => {
      this.el.dispatchEvent(
        new CustomEvent('erix-blur', {
          bubbles: true,
          composed: true,
        })
      );
    });

    // Emit ready event
    this.el.dispatchEvent(
      new CustomEvent('erix-ready', {
        bubbles: true,
        composed: true,
        detail: { api: this._api },
      })
    );
  }

  private buildConfig(): EditorConfig {
    // Merge prop-based config with config object
    const config: EditorConfig = {
      ...this.config,
      theme: this.theme as 'light' | 'dark',
      placeholder: this.placeholder,
      readonly: this.readonly,
    };

    // Handle shorthand props
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

  // ===========================================================================
  // RENDER
  // ===========================================================================

  render() {
    return (
      <Host data-theme={this.theme}>
        <div class="editor-wrapper">
          {/* Toolbar Component - renders plugins based on config */}
          <erix-toolbar
            ref={el => (this.toolbarRef = el)}
            view={this.editorView}
            theme={this.theme}
            items={this.config?.toolbar?.items || ['undo',
              'redo',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              'superscript',
              'subscript',
              'uppercase',
              'lowercase',
              'bullet-list',
              'ordered-list',
              'page-break',
              'print', 'import-word']}
            showThemeToggle={true}
            onThemeToggle={this.handleThemeToggle}

          ></erix-toolbar>

          {/* Editor Content Area */}
          <div class="editor-content">
            <div class="editor-canvas" ref={el => (this.editorContainer = el)}></div>
          </div>
        </div>
      </Host>
    );
  }
}
