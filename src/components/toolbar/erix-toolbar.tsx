import { Component, Host, h, Prop, Event, EventEmitter, Element, Listen, State, Method, Watch } from '@stencil/core';
import { EditorView } from 'prosemirror-view';
import {
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

export interface ToolbarState {
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
}

/**
 * @component ErixToolbar
 * The main toolbar component for the editor.
 * Provides all formatting controls and delegates commands to the editor view.
 */
@Component({
  tag: 'erix-toolbar',
  styleUrl: 'erix-toolbar.css',
  shadow: true,
})
export class ErixToolbar {
  @Element() el!: HTMLElement;

  /**
   * Reference to the ProseMirror EditorView
   */
  @Prop() view?: EditorView;

  /**
   * Current theme
   */
  @Prop() theme: 'light' | 'dark' | string = 'light';

  /**
   * Current active formats state
   */
  @State() private activeFormats: ToolbarState = {
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

  /**
   * Event emitted when theme toggle is requested
   */
  @Event() themeToggle: EventEmitter<void>;

  componentWillLoad() {
    this.updateActiveFormats();
  }

  @Watch('view')
  onViewChange() {
    this.updateActiveFormats();
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

  /**
   * Call this method from the parent to refresh the toolbar state
   */
  @Method()
  async updateActiveFormats() {
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

  // Command handlers
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
    this.themeToggle.emit();
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

  render() {
    const { activeFormats } = this;

    return (
      <Host>
        <div class="erix-toolbar">
          {/* History Group: Undo/Redo */}
          <div class="toolbar-group">
            <erix-button
              active={false}
              disabled={!activeFormats.canUndo}
              buttonTitle="Undo (Ctrl+Z)"
              onErixClick={this.handleUndo}
            >
              <erix-icon name="undo" size={18}></erix-icon>
            </erix-button>
            <erix-button
              active={false}
              disabled={!activeFormats.canRedo}
              buttonTitle="Redo (Ctrl+Y)"
              onErixClick={this.handleRedo}
            >
              <erix-icon name="redo" size={18}></erix-icon>
            </erix-button>
          </div>

          <erix-divider></erix-divider>

          {/* Heading Group */}
          <div class="toolbar-group">
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
          </div>

          <erix-divider></erix-divider>

          {/* Font Group */}
          <div class="toolbar-group">
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
          </div>

          <erix-divider></erix-divider>

          {/* Alignment Group */}
          <div class="toolbar-group">
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
          </div>

          <erix-divider></erix-divider>

          {/* Format Group: Bold, Italic, Underline, etc. */}
          <div class="toolbar-group">
            <erix-button
              active={activeFormats.bold}
              buttonTitle="Bold (Ctrl+B)"
              onErixClick={this.handleBold}
            >
              <erix-icon name="formatBold" size={18}></erix-icon>
            </erix-button>
            <erix-button
              active={activeFormats.italic}
              buttonTitle="Italic (Ctrl+I)"
              onErixClick={this.handleItalic}
            >
              <erix-icon name="formatItalic" size={18}></erix-icon>
            </erix-button>
            <erix-button
              active={activeFormats.underline}
              buttonTitle="Underline (Ctrl+U)"
              onErixClick={this.handleUnderline}
            >
              <erix-icon name="formatUnderline" size={18}></erix-icon>
            </erix-button>
            <erix-button
              active={activeFormats.strikethrough}
              buttonTitle="Strikethrough"
              onErixClick={this.handleStrikethrough}
            >
              <erix-icon name="formatStrikethrough" size={18}></erix-icon>
            </erix-button>
            <erix-button
              active={activeFormats.superscript}
              buttonTitle="Superscript"
              onErixClick={this.handleSuperscript}
            >
              <erix-icon name="superScript" size={18}></erix-icon>
            </erix-button>
            <erix-button
              active={activeFormats.subscript}
              buttonTitle="Subscript"
              onErixClick={this.handleSubscript}
            >
              <erix-icon name="subScript" size={18}></erix-icon>
            </erix-button>
          </div>

          <erix-divider></erix-divider>

          {/* Text Case Group */}
          <div class="toolbar-group">
            <erix-button
              buttonTitle="Convert to Uppercase"
              onErixClick={this.handleUpperCase}
            >
              <erix-icon name="upperCase" size={18}></erix-icon>
            </erix-button>
            <erix-button
              buttonTitle="Convert to Lowercase"
              onErixClick={this.handleLowerCase}
            >
              <erix-icon name="lowerCase" size={18}></erix-icon>
            </erix-button>
          </div>

          <erix-divider></erix-divider>

          {/* List Group */}
          <div class="toolbar-group">
            <erix-button
              active={activeFormats.bulletList}
              buttonTitle="Bullet List"
              onErixClick={this.handleBulletList}
            >
              <erix-icon name="bulletList" size={18}></erix-icon>
            </erix-button>
            <erix-button
              active={activeFormats.orderedList}
              buttonTitle="Numbered List"
              onErixClick={this.handleOrderedList}
            >
              <erix-icon name="numberList" size={18}></erix-icon>
            </erix-button>
          </div>

          <erix-divider></erix-divider>

          {/* Utility Group */}
          <div class="toolbar-group">
            <erix-button
              buttonTitle="Insert Page Break"
              onErixClick={this.handlePageBreak}
            >
              <erix-icon name="pageBreak" size={18}></erix-icon>
            </erix-button>
            <erix-button
              buttonTitle="Print Document (Ctrl+P)"
              onErixClick={this.handlePrint}
            >
              <erix-icon name="print" size={18}></erix-icon>
            </erix-button>
          </div>

          <div class="toolbar-spacer"></div>

          {/* Theme Toggle */}
          <div class="toolbar-group">
            <erix-button
              buttonTitle={this.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              onErixClick={this.handleThemeToggle}
            >
              <erix-icon
                name={this.theme === 'light' ? 'darkMode' : 'lightMode'}
                size={20}
              ></erix-icon>
            </erix-button>
          </div>
        </div>
      </Host>
    );
  }
}
