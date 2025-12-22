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
  toggleSuperscript,
  toggleSubscript,
  toggleBulletList,
  toggleOrderedList,
  isBoldActive,
  isItalicActive,
  isUnderlineActive,
  isStrikethroughActive,
  isSuperscriptActive,
  isSubscriptActive,
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
  setTextLineSpacing,
  getActiveLineSpacing,
  setTextCase,
  undo,
  redo,
} from '@src/core';

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

  // Internal state
  @State() private activeFormats: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    superscript: boolean;
    subscript: boolean;
    bulletList: boolean;
    orderedList: boolean;
    headingLevel: number | null;
    fontFamily: string;
    fontSize: string;
    textAlign: string;
    lineSpacing: string;
    canUndo: boolean;
    canRedo: boolean;
  } = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      superscript: false,
      subscript: false,
      bulletList: false,
      orderedList: false,
      headingLevel: null,
      fontFamily: '',
      fontSize: '',
      textAlign: 'left',
      lineSpacing: 'normal',
      canUndo: false,
      canRedo: false,
    };

  @State() private isAlignmentMenuOpen: boolean = false;
  @State() private isLineSpacingMenuOpen: boolean = false;

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
      superscript: isSuperscriptActive(state),
      subscript: isSubscriptActive(state),
      bulletList: isInBulletList(state),
      orderedList: isInOrderedList(state),
      headingLevel: getCurrentHeadingLevel(state),
      fontFamily: getActiveFontFamily(state),
      fontSize: getActiveFontSize(state),
      textAlign: getActiveAlignment(state),
      lineSpacing: getActiveLineSpacing(state),
      canUndo: undo(state),
      canRedo: redo(state),
    };
  }

  @Listen('mousedown', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    const path = event.composedPath();

    if (this.isAlignmentMenuOpen) {
      const el = this.el.shadowRoot?.querySelector('.alignment-dropdown-container');
      if (el && !path.includes(el)) {
        this.isAlignmentMenuOpen = false;
      }
    }

    if (this.isLineSpacingMenuOpen) {
      const el = this.el.shadowRoot?.querySelector('.line-spacing-dropdown-container');
      if (el && !path.includes(el)) {
        this.isLineSpacingMenuOpen = false;
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

  private handleSuperscript = () => {
    if (this.view) {
      toggleSuperscript(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleSubscript = () => {
    if (this.view) {
      toggleSubscript(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleUpperCase = () => {
    if (this.view) {
      setTextCase('uppercase')(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleLowerCase = () => {
    if (this.view) {
      setTextCase('lowercase')(this.view.state, this.view.dispatch);
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

  private handleLineSpacingChange = (spacing: string) => {
    if (this.view) {
      setTextLineSpacing(spacing)(this.view.state, this.view.dispatch);
      this.isLineSpacingMenuOpen = false;
      this.view.focus();
    }
  };

  private handleUndo = () => {
    if (this.view) {
      undo(this.view.state, this.view.dispatch);
      this.view.focus();
    }
  };

  private handleRedo = () => {
    if (this.view) {
      redo(this.view.state, this.view.dispatch);
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
            {/* Undo */}
            <button
              class="toolbar-btn"
              onClick={this.handleUndo}
              disabled={!activeFormats.canUndo}
              title="Undo (Ctrl+Z)"
            >
              <erix-icon name="undo" size={18}></erix-icon>
            </button>

            {/* Redo */}
            <button
              class="toolbar-btn"
              onClick={this.handleRedo}
              disabled={!activeFormats.canRedo}
              title="Redo (Ctrl+Y)"
            >
              <erix-icon name="redo" size={18}></erix-icon>
            </button>

            <div class="toolbar-divider"></div>

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
                <erix-icon name={this.getAlignmentIcon(activeFormats.textAlign) as any} size={18}></erix-icon>
              </button>
              {this.isAlignmentMenuOpen && (
                <div class="toolbar-dropdown-menu alignment-menu">
                  <button
                    class={{ 'dropdown-item': true, 'active': activeFormats.textAlign === 'left' }}
                    onClick={() => this.handleAlignmentChange('left')}
                    title="Align Left"
                  >
                    <erix-icon name="textAlignLeft" size={18}></erix-icon>
                  </button>
                  <button
                    class={{ 'dropdown-item': true, 'active': activeFormats.textAlign === 'center' }}
                    onClick={() => this.handleAlignmentChange('center')}
                    title="Align Center"
                  >
                    <erix-icon name="textAlignCenter" size={18}></erix-icon>
                  </button>
                  <button
                    class={{ 'dropdown-item': true, 'active': activeFormats.textAlign === 'right' }}
                    onClick={() => this.handleAlignmentChange('right')}
                    title="Align Right"
                  >
                    <erix-icon name="textAlignRight" size={18}></erix-icon>
                  </button>
                  <button
                    class={{ 'dropdown-item': true, 'active': activeFormats.textAlign === 'justify' }}
                    onClick={() => this.handleAlignmentChange('justify')}
                    title="Justify"
                  >
                    <erix-icon name="textAlignJustify" size={18}></erix-icon>
                  </button>
                </div>
              )}
            </div>

            {/* Line Spacing Dropdown */}
            <div class="toolbar-dropdown-container line-spacing-dropdown-container">
              <button
                class={{ 'toolbar-btn': true, 'active': this.isLineSpacingMenuOpen }}
                onClick={() => this.isLineSpacingMenuOpen = !this.isLineSpacingMenuOpen}
                title="Line Spacing"
              >
                <erix-icon name="textLineSpacing" size={18}></erix-icon>
              </button>
              {this.isLineSpacingMenuOpen && (
                <div class="toolbar-dropdown-menu line-spacing-menu">
                  {['1', '1.15', '1.5', '2', '2.5', '3'].map(spacing => (
                    <button
                      class={{ 'dropdown-item spacing-item': true, 'active': activeFormats.lineSpacing === spacing }}
                      onClick={() => this.handleLineSpacingChange(spacing)}
                    >
                      <span class="spacing-check">{activeFormats.lineSpacing === spacing ? '✓' : ''}</span>
                      <span class="spacing-value">{spacing}</span>
                    </button>
                  ))}
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
              <erix-icon name="formatBold" size={18}></erix-icon>
            </button>

            {/* Italic */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.italic }}
              onClick={this.handleItalic}
              title="Italic (Ctrl+I)"
            >
              <erix-icon name="formatItalic" size={18}></erix-icon>
            </button>

            {/* Underline */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.underline }}
              onClick={this.handleUnderline}
              title="Underline (Ctrl+U)"
            >
              <erix-icon name="formatUnderline" size={18}></erix-icon>
            </button>

            {/* Strikethrough */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.strikethrough }}
              onClick={this.handleStrikethrough}
              title="Strikethrough"
            >
              <erix-icon name="formatStrikethrough" size={18}></erix-icon>
            </button>

            {/* Superscript */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.superscript }}
              onClick={this.handleSuperscript}
              title="Superscript"
            >
              <erix-icon name="superScript" size={18}></erix-icon>
            </button>

            {/* Subscript */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.subscript }}
              onClick={this.handleSubscript}
              title="Subscript"
            >
              <erix-icon name="subScript" size={18}></erix-icon>
            </button>

            <div class="toolbar-divider"></div>

            {/* Uppercase */}
            <button
              class="toolbar-btn"
              onClick={this.handleUpperCase}
              title="Convert to Uppercase"
            >
              <erix-icon name="upperCase" size={18}></erix-icon>
            </button>

            {/* Lowercase */}
            <button
              class="toolbar-btn"
              onClick={this.handleLowerCase}
              title="Convert to Lowercase"
            >
              <erix-icon name="lowerCase" size={18}></erix-icon>
            </button>

            <div class="toolbar-divider"></div>

            {/* Bullet List */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.bulletList }}
              onClick={this.handleBulletList}
              title="Bullet List"
            >
              <erix-icon name="bulletList" size={18}></erix-icon>
            </button>

            {/* Numbered List */}
            <button
              class={{ 'toolbar-btn': true, 'active': activeFormats.orderedList }}
              onClick={this.handleOrderedList}
              title="Numbered List"
            >
              <erix-icon name="numberList" size={18}></erix-icon>
            </button>

            <div class="toolbar-divider"></div>

            {/* Page Break */}
            <button
              class="toolbar-btn"
              onClick={this.handlePageBreak}
              title="Insert Page Break"
            >
              <erix-icon name="pageBreak" size={18}></erix-icon>
            </button>

            {/* Print */}
            <button
              class="toolbar-btn"
              onClick={this.handlePrint}
              title="Print Document (Ctrl+P)"
            >
              <erix-icon name="print" size={18}></erix-icon>
            </button>

            <div class="toolbar-spacer"></div>

            {/* Theme Toggle */}
            <button
              class="toolbar-btn theme-toggle-btn"
              onClick={this.handleThemeToggle}
              title={this.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <erix-icon
                name={this.theme === 'light' ? 'darkMode' : 'lightMode'}
                size={20}
              ></erix-icon>
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
