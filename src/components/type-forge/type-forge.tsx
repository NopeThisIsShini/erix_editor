import { Component, Host, h, Prop, State, Element, Watch } from '@stencil/core';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import {
  editorSchema,
  editorPlugins,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleBulletList,
  toggleOrderedList,
  isBoldActive,
  isItalicActive,
  isUnderlineActive,
  isStrikethroughActive,
  isInBulletList,
  isInOrderedList,
  setHeading,
  setParagraph,
  getCurrentHeadingLevel,
  printDocument,
  insertPageBreak,
} from '../../core';

/**
 * @component TypeForge
 * A rich text editor component with built-in toolbar.
 */
@Component({
  tag: 'type-forge',
  styleUrl: 'type-forge.css',
  shadow: true,
})
export class TypeForge {
  @Element() el!: HTMLElement;

  /**
   * The editor theme.
   */
  @Prop({ reflect: true, mutable: true }) theme: 'light' | 'dark' | string = 'light';

  /**
   * Placeholder text when editor is empty.
   */
  @Prop() placeholder: string = 'Start typing...';

  // Internal state
  @State() private activeFormats: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    bulletList: boolean;
    orderedList: boolean;
    headingLevel: number | null;
  } = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      bulletList: false,
      orderedList: false,
      headingLevel: null,
    };

  private editorContainer?: HTMLDivElement;
  private view?: EditorView;

  componentDidLoad() {
    this.initializeEditor();
  }

  disconnectedCallback() {
    if (this.view) {
      this.view.destroy();
      this.view = undefined;
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

    this.view = new EditorView(this.editorContainer, {
      state,
      dispatchTransaction: (tr) => {
        if (!this.view) return;

        const newState = this.view.state.apply(tr);
        this.view.updateState(newState);
        this.updateActiveFormats();
      },
    });

    this.updateActiveFormats();
  }

  private updateActiveFormats() {
    if (!this.view) return;

    const state = this.view.state;
    this.activeFormats = {
      bold: isBoldActive(state),
      italic: isItalicActive(state),
      underline: isUnderlineActive(state),
      strikethrough: isStrikethroughActive(state),
      bulletList: isInBulletList(state),
      orderedList: isInOrderedList(state),
      headingLevel: getCurrentHeadingLevel(state),
    };
  }

  // ============================================================================
  // COMMAND HANDLERS
  // ============================================================================

  private handleBold = () => {
    if (this.view) {
      toggleBold(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleItalic = () => {
    if (this.view) {
      toggleItalic(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleUnderline = () => {
    if (this.view) {
      toggleUnderline(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleStrikethrough = () => {
    if (this.view) {
      toggleStrikethrough(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleBulletList = () => {
    if (this.view) {
      toggleBulletList(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleOrderedList = () => {
    if (this.view) {
      toggleOrderedList(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleHeadingChange = (event: Event) => {
    if (!this.view) return;

    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (value === 'p') {
      setParagraph(this.view.state, this.view.dispatch);
    } else {
      const level = parseInt(value, 10);
      setHeading(level)(this.view.state, this.view.dispatch);
    }

    this.view.focus();
  };

  private handleThemeToggle = () => {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  };

  private handlePageBreak = () => {
    if (this.view) {
      insertPageBreak(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handlePrint = () => {
    printDocument();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  render() {
    const { activeFormats } = this;

    return (
      <Host data-theme={this.theme}>
        <div class="editor-wrapper">
          {/* Toolbar */}
          <div class="editor-toolbar">
            {/* Heading Dropdown */}
            <select
              class="toolbar-select"
              onChange={this.handleHeadingChange}
              title="Text Style"
            >
              <option value="p" selected={activeFormats.headingLevel === null}>
                Paragraph
              </option>
              <option value="1" selected={activeFormats.headingLevel === 1}>
                Heading 1
              </option>
              <option value="2" selected={activeFormats.headingLevel === 2}>
                Heading 2
              </option>
              <option value="3" selected={activeFormats.headingLevel === 3}>
                Heading 3
              </option>
              <option value="4" selected={activeFormats.headingLevel === 4}>
                Heading 4
              </option>
              <option value="5" selected={activeFormats.headingLevel === 5}>
                Heading 5
              </option>
              <option value="6" selected={activeFormats.headingLevel === 6}>
                Heading 6
              </option>
            </select>

            <div class="toolbar-divider"></div>

            {/* Bold */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.bold }}
              onClick={this.handleBold}
              title="Bold (Ctrl+B)"
            >
              <editor-icon name="formatBold" size={18}></editor-icon>
            </button>

            {/* Italic */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.italic }}
              onClick={this.handleItalic}
              title="Italic (Ctrl+I)"
            >
              <editor-icon name="formatItalic" size={18}></editor-icon>
            </button>

            {/* Underline */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.underline }}
              onClick={this.handleUnderline}
              title="Underline (Ctrl+U)"
            >
              <editor-icon name="formatUnderline" size={18}></editor-icon>
            </button>

            {/* Strikethrough */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.strikethrough }}
              onClick={this.handleStrikethrough}
              title="Strikethrough"
            >
              <editor-icon name="formatStrikethrough" size={18}></editor-icon>
            </button>

            <div class="toolbar-divider"></div>

            {/* Bullet List */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.bulletList }}
              onClick={this.handleBulletList}
              title="Bullet List"
            >
              <editor-icon name="bulletList" size={18}></editor-icon>
            </button>

            {/* Numbered List */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.orderedList }}
              onClick={this.handleOrderedList}
              title="Numbered List"
            >
              <editor-icon name="numberList" size={18}></editor-icon>
            </button>

            <div class="toolbar-divider"></div>

            {/* Page Break */}
            <button
              class="toolbar-btn"
              onClick={this.handlePageBreak}
              title="Insert Page Break"
            >
              <editor-icon name="pageBreak" size={18}></editor-icon>
            </button>

            {/* Print */}
            <button
              class="toolbar-btn"
              onClick={this.handlePrint}
              title="Print Document (Ctrl+P)"
            >
              <editor-icon name="print" size={18}></editor-icon>
            </button>

            <div class="toolbar-spacer"></div>

            {/* Theme Toggle */}
            <button
              class="toolbar-btn theme-toggle-btn"
              onClick={this.handleThemeToggle}
              title={this.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <editor-icon
                name={this.theme === 'light' ? 'darkMode' : 'lightMode'}
                size={20}
              ></editor-icon>
            </button>
          </div>

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
