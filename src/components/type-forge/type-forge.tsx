import { Component, Host, h, Prop, State, Element, Watch, Listen } from '@stencil/core';
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
  getActiveFontFamily,
  getActiveFontSize,
  setFontFamily,
  setFontSize,
  setTextAlignment,
  getActiveAlignment,
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
    fontFamily: string;
    fontSize: string;
    textAlign: string;
  } = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      bulletList: false,
      orderedList: false,
      headingLevel: null,
      fontFamily: '',
      fontSize: '',
      textAlign: 'left',
    };

  @State() private isAlignmentMenuOpen: boolean = false;

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
      fontFamily: getActiveFontFamily(state),
      fontSize: getActiveFontSize(state),
      textAlign: getActiveAlignment(state),
    };
  }

  @Listen('mousedown', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    if (this.isAlignmentMenuOpen) {
      const path = event.composedPath();
      const toolbarDropdown = this.el.shadowRoot?.querySelector('.alignment-dropdown-container');
      if (toolbarDropdown && !path.includes(toolbarDropdown)) {
        this.isAlignmentMenuOpen = false;
      }
    }
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

  private handleFontFamilyChange = (event: Event) => {
    if (!this.view) return;
    const select = event.target as HTMLSelectElement;
    setFontFamily(select.value)(this.view.state, this.view.dispatch);
    this.view.focus();
  };

  private handleFontSizeChange = (event: Event) => {
    if (!this.view) return;
    const select = event.target as HTMLSelectElement;
    setFontSize(select.value)(this.view.state, this.view.dispatch);
    this.view.focus();
  };

  private handleAlignmentChange = (align: string) => {
    if (this.view) {
      setTextAlignment(align)(this.view.state, this.view.dispatch);
      this.isAlignmentMenuOpen = false;
      this.view.focus();
    }
  };

  private getAlignmentIcon(align: string): string {
    switch (align) {
      case 'center': return 'textAlignCenter';
      case 'right': return 'textAlignRight';
      case 'justify': return 'textAlignJustify';
      default: return 'textAlignLeft';
    }
  }

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

            {/* Font Family Dropdown */}
            <select
              class="toolbar-select font-family-select"
              onChange={this.handleFontFamilyChange}
              title="Font Family"
            >
              <option value="" selected={activeFormats.fontFamily === ''}>Font</option>
              <option value="Inter, system-ui, sans-serif" selected={activeFormats.fontFamily === 'Inter, system-ui, sans-serif'}>Inter</option>
              <option value="Roboto, sans-serif" selected={activeFormats.fontFamily === 'Roboto, sans-serif'}>Roboto</option>
              <option value="Playfair Display, serif" selected={activeFormats.fontFamily === 'Playfair Display, serif'}>Serif</option>
              <option value="Fira Code, monospace" selected={activeFormats.fontFamily === 'Fira Code, monospace'}>Monospace</option>
              <option value="cursive" selected={activeFormats.fontFamily === 'cursive'}>Cursive</option>
            </select>

            {/* Font Size Dropdown */}
            <select
              class="toolbar-select font-size-select"
              onChange={this.handleFontSizeChange}
              title="Font Size"
            >
              <option value="" selected={activeFormats.fontSize === ''}>Size</option>
              {[10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72].map(size => (
                <option value={`${size}px`} selected={activeFormats.fontSize === `${size}px`}>{size}</option>
              ))}
            </select>

            <div class="toolbar-divider"></div>

            {/* Alignment Dropdown */}
            <div class="toolbar-dropdown-container alignment-dropdown-container">
              <button
                class={{ 'toolbar-btn': true, 'active': this.isAlignmentMenuOpen }}
                onClick={() => this.isAlignmentMenuOpen = !this.isAlignmentMenuOpen}
                title="Text Alignment"
              >
                <editor-icon name={this.getAlignmentIcon(activeFormats.textAlign) as any} size={18}></editor-icon>
              </button>
              {this.isAlignmentMenuOpen && (
                <div class="toolbar-dropdown-menu alignment-menu">
                  <button
                    class={{ 'dropdown-item': true, 'active': activeFormats.textAlign === 'left' }}
                    onClick={() => this.handleAlignmentChange('left')}
                    title="Align Left"
                  >
                    <editor-icon name="textAlignLeft" size={18}></editor-icon>
                  </button>
                  <button
                    class={{ 'dropdown-item': true, 'active': activeFormats.textAlign === 'center' }}
                    onClick={() => this.handleAlignmentChange('center')}
                    title="Align Center"
                  >
                    <editor-icon name="textAlignCenter" size={18}></editor-icon>
                  </button>
                  <button
                    class={{ 'dropdown-item': true, 'active': activeFormats.textAlign === 'right' }}
                    onClick={() => this.handleAlignmentChange('right')}
                    title="Align Right"
                  >
                    <editor-icon name="textAlignRight" size={18}></editor-icon>
                  </button>
                  <button
                    class={{ 'dropdown-item': true, 'active': activeFormats.textAlign === 'justify' }}
                    onClick={() => this.handleAlignmentChange('justify')}
                    title="Justify"
                  >
                    <editor-icon name="textAlignJustify" size={18}></editor-icon>
                  </button>
                </div>
              )}
            </div>

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
