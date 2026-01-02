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
  printDocument,
  insertPageBreak,
  setTextCase,
  setTextAlignment,
  getActiveAlignment,
  setFontSize,
  getActiveFontSize,
  setFontFamily,
  getActiveFontFamily,
  undo,
  redo,
  insertTable,
} from '@src/core';
import type { ToolbarItem } from '@src/api';
import type { SelectOption } from '../ui/erix-select/erix-select';

/**
 * Plugin definition for toolbar items
 */
export interface ToolbarPluginDef {
  id: string;
  label: string;
  icon: string;
  group: string;
  shortcut?: string;
  execute: (view: EditorView) => void | Promise<void>;
  isActive?: (view: EditorView) => boolean;
  isDisabled?: (view: EditorView) => boolean;
  type?: 'button' | 'dropdown' | 'select';
  options?: { value: string; label: string, icon?: string }[];
}

/**
 * Built-in plugin definitions
 */
const BUILTIN_PLUGINS: Record<string, ToolbarPluginDef> = {
  // History
  'undo': {
    id: 'undo',
    label: 'Undo',
    icon: 'undo',
    group: 'history',
    shortcut: 'Ctrl+Z',
    execute: (view) => { undo(view.state, view.dispatch); view.focus(); },
    isDisabled: (view) => !undo(view.state),
  },
  'redo': {
    id: 'redo',
    label: 'Redo',
    icon: 'redo',
    group: 'history',
    shortcut: 'Ctrl+Y',
    execute: (view) => { redo(view.state, view.dispatch); view.focus(); },
    isDisabled: (view) => !redo(view.state),
  },

  // Formatting
  'bold': {
    id: 'bold',
    label: 'Bold',
    icon: 'formatBold',
    group: 'formatting',
    shortcut: 'Ctrl+B',
    execute: (view) => { toggleBold(view.state, view.dispatch); view.focus(); },
    isActive: (view) => isBoldActive(view.state),
  },
  'italic': {
    id: 'italic',
    label: 'Italic',
    icon: 'formatItalic',
    group: 'formatting',
    shortcut: 'Ctrl+I',
    execute: (view) => { toggleItalic(view.state, view.dispatch); view.focus(); },
    isActive: (view) => isItalicActive(view.state),
  },
  'underline': {
    id: 'underline',
    label: 'Underline',
    icon: 'formatUnderline',
    group: 'formatting',
    shortcut: 'Ctrl+U',
    execute: (view) => { toggleUnderline(view.state, view.dispatch); view.focus(); },
    isActive: (view) => isUnderlineActive(view.state),
  },
  'strikethrough': {
    id: 'strikethrough',
    label: 'Strikethrough',
    icon: 'formatStrikethrough',
    group: 'formatting',
    execute: (view) => { toggleStrikethrough(view.state, view.dispatch); view.focus(); },
    isActive: (view) => isStrikethroughActive(view.state),
  },
  'superscript': {
    id: 'superscript',
    label: 'Superscript',
    icon: 'superScript',
    group: 'formatting',
    execute: (view) => { toggleSuperscript(view.state, view.dispatch); view.focus(); },
    isActive: (view) => isSuperscriptActive(view.state),
  },
  'subscript': {
    id: 'subscript',
    label: 'Subscript',
    icon: 'subScript',
    group: 'formatting',
    execute: (view) => { toggleSubscript(view.state, view.dispatch); view.focus(); },
    isActive: (view) => isSubscriptActive(view.state),
  },

  // Text Case
  'uppercase': {
    id: 'uppercase',
    label: 'Uppercase',
    icon: 'upperCase',
    group: 'textcase',
    execute: (view) => { setTextCase('uppercase')(view.state, view.dispatch); view.focus(); },
  },
  'lowercase': {
    id: 'lowercase',
    label: 'Lowercase',
    icon: 'lowerCase',
    group: 'textcase',
    execute: (view) => { setTextCase('lowercase')(view.state, view.dispatch); view.focus(); },
  },

  // Lists
  'bullet-list': {
    id: 'bullet-list',
    label: 'Bullet List',
    icon: 'bulletList',
    group: 'lists',
    execute: (view) => { toggleBulletList(view.state, view.dispatch); view.focus(); },
    isActive: (view) => isInBulletList(view.state),
  },
  'ordered-list': {
    id: 'ordered-list',
    label: 'Numbered List',
    icon: 'numberList',
    group: 'lists',
    execute: (view) => { toggleOrderedList(view.state, view.dispatch); view.focus(); },
    isActive: (view) => isInOrderedList(view.state),
  },

  // Insert
  'page-break': {
    id: 'page-break',
    label: 'Page Break',
    icon: 'pageBreak',
    group: 'insert',
    execute: (view) => { insertPageBreak(view.state, view.dispatch); view.focus(); },
  },

  // Alignment
  'align-left': {
    id: 'align-left',
    label: 'Align Left',
    icon: 'textAlignLeft',
    group: 'alignment',
    execute: (view) => { setTextAlignment('left')(view.state, view.dispatch); view.focus(); },
    isActive: (view) => getActiveAlignment(view.state) === 'left',
  },
  'align-center': {
    id: 'align-center',
    label: 'Align Center',
    icon: 'textAlignCenter',
    group: 'alignment',
    execute: (view) => { setTextAlignment('center')(view.state, view.dispatch); view.focus(); },
    isActive: (view) => getActiveAlignment(view.state) === 'center',
  },
  'align-right': {
    id: 'align-right',
    label: 'Align Right',
    icon: 'textAlignRight',
    group: 'alignment',
    execute: (view) => { setTextAlignment('right')(view.state, view.dispatch); view.focus(); },
    isActive: (view) => getActiveAlignment(view.state) === 'right',
  },
  'align-justify': {
    id: 'align-justify',
    label: 'Justify',
    icon: 'textAlignJustify',
    group: 'alignment',
    execute: (view) => { setTextAlignment('justify')(view.state, view.dispatch); view.focus(); },
    isActive: (view) => getActiveAlignment(view.state) === 'justify',
  },

  // Font Family
  'font-family': {
    id: 'font-family',
    label: 'Font Family',
    icon: 'fontFamily',
    group: 'font',
    type: 'select',
    options: [
      { value: '', label: 'Font' },
      { value: 'Arial, sans-serif', label: 'Arial', icon: 'A' },
      { value: '"Times New Roman", serif', label: 'Times New Roman', icon: 'T' },
      { value: 'Georgia, serif', label: 'Georgia', icon: 'G' },
      { value: '"Courier New", monospace', label: 'Courier New', icon: 'C' },
      { value: 'Verdana, sans-serif', label: 'Verdana', icon: 'V' },
      { value: 'Tahoma, sans-serif', label: 'Tahoma', icon: 'T' },
      { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS', icon: 'T' },
      { value: 'Impact, sans-serif', label: 'Impact', icon: 'I' },
      { value: '"Comic Sans MS", cursive', label: 'Comic Sans MS', icon: 'C' },
      { value: '"Lucida Console", monospace', label: 'Lucida Console', icon: 'L' },
    ],
    execute: (view) => { /* Handled by select change */ view.focus(); },
  },

  // Font Size
  'font-size': {
    id: 'font-size',
    label: 'Font Size',
    icon: 'fontSize',
    group: 'font',
    type: 'select',
    options: [
      { value: '', label: 'Size' },
      { value: '8pt', label: '8' },
      { value: '9pt', label: '9' },
      { value: '10pt', label: '10' },
      { value: '11pt', label: '11' },
      { value: '12pt', label: '12' },
      { value: '14pt', label: '14' },
      { value: '16pt', label: '16' },
      { value: '18pt', label: '18' },
      { value: '20pt', label: '20' },
      { value: '22pt', label: '22' },
      { value: '24pt', label: '24' },
      { value: '26pt', label: '26' },
      { value: '28pt', label: '28' },
      { value: '36pt', label: '36' },
      { value: '48pt', label: '48' },
      { value: '72pt', label: '72' },
    ],
    execute: (view) => { /* Handled by select change */ view.focus(); },
  },

  // Tools
  'print': {
    id: 'print',
    label: 'Print',
    icon: 'print',
    group: 'tools',
    shortcut: 'Ctrl+P',
    execute: () => { printDocument(); },
  },
  'import-word': {
    id: 'import-word',
    label: 'Import from Word',
    icon: 'importFromWord',
    group: 'tools',
    execute: async (view) => {
      try {
        const { openWordFileDialog, parseFromHTML } = await import('@src/api/serializers');
        const result = await openWordFileDialog();

        if (result && view) {
          const schema = view.state.schema;
          const doc = parseFromHTML(result.html, schema);

          // Replace content
          const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content);
          view.dispatch(tr);
          view.focus();
        }
      } catch (error) {
        console.error('[import-word] Failed:', error);
        alert('Failed to import Word document. Error: ' + (error as Error).message);
      }
    },
  },
  'table': {
    id: 'table',
    label: 'Insert Table',
    icon: 'table',
    group: 'insert',
    type: 'dropdown',
    execute: () => { },
  },
};

/**
 * @component ErixToolbar
 * Dynamic toolbar that renders plugins based on configuration.
 * Only shows plugins that are configured - no static buttons.
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
   * @default 'light'
   */
  @Prop({ reflect: true, attribute: 'data-theme' }) theme: 'light' | 'dark' | string = 'light';

  /**
   * Toolbar items to display. Array of plugin IDs.
   * Use '|' for separator (only shown between different groups).
   * Example: ['bold', 'italic', '|', 'bullet-list', 'ordered-list']
   */
  @Prop() items: ToolbarItem[] = [];

  /**
   * Show theme toggle in toolbar
   * @default true
   */
  @Prop() showThemeToggle: boolean = true;

  /**
   * State for dropdown menus
   */
  @State() private activeDropdown: string | null = null;

  /**
   * Force re-render on selection change
   */
  @State() private updateCounter: number = 0;

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

    if (this.activeDropdown) {
      const el = this.el.shadowRoot?.querySelector(`.dropdown-${this.activeDropdown}`);
      if (el && !path.includes(el)) {
        this.activeDropdown = null;
      }
    }
  }

  /**
   * Call this method from the parent to refresh the toolbar state
   */
  @Method()
  async updateActiveFormats() {
    if (!this.view) return;
    // Trigger re-render by updating counter
    this.updateCounter++;
  }

  private handleThemeToggle = () => {
    this.themeToggle.emit();
  };

  private getPlugin(id: string): ToolbarPluginDef | null {
    return BUILTIN_PLUGINS[id] || null;
  }

  private handlePluginClick = async (plugin: ToolbarPluginDef) => {
    if (!this.view) return;

    const result = plugin.execute(this.view);
    // Handle async execute functions
    if (result instanceof Promise) {
      await result;
    }

    this.updateActiveFormats();
  };

  private handleFontSizeChange = (event: CustomEvent<string>) => {
    if (!this.view) return;
    const size = event.detail;
    if (size) {
      setFontSize(size)(this.view.state, this.view.dispatch);
      this.view.focus();
      this.updateActiveFormats();
    }
  };

  private handleFontFamilyChange = (event: CustomEvent<string>) => {
    if (!this.view) return;
    const family = event.detail;
    setFontFamily(family)(this.view.state, this.view.dispatch);
    this.view.focus();
    this.updateActiveFormats();
  };

  private handleInsertTable = (rows: number, cols: number) => {
    if (!this.view) return;
    this.view.focus();
    insertTable(rows, cols)(this.view.state, this.view.dispatch);
    this.updateActiveFormats();
  };

  /**
   * Render a single plugin button
   */
  private renderPluginButton(plugin: ToolbarPluginDef) {
    if (!this.view) return null;

    const isActive = plugin.isActive ? plugin.isActive(this.view) : false;
    const isDisabled = plugin.isDisabled ? plugin.isDisabled(this.view) : false;
    const tooltip = plugin.shortcut ? `${plugin.label} (${plugin.shortcut})` : plugin.label;

    return (
      <erix-button
        key={plugin.id}
        active={isActive}
        disabled={isDisabled}
        buttonTitle={tooltip}
        onErixClick={() => this.handlePluginClick(plugin)}
      >
        <erix-icon name={plugin.icon as any} size={18}></erix-icon>
      </erix-button>
    );
  }

  /**
   * Render a select-type plugin (dropdown) using erix-select component
   */
  private renderSelectPlugin(plugin: ToolbarPluginDef) {
    if (!this.view || !plugin.options) return null;

    // Determine current value and handler based on plugin type
    let currentValue = '';
    let changeHandler: (event: CustomEvent<string>) => void;
    let width: 'sm' | 'md' | 'lg' = 'md';

    if (plugin.id === 'font-size') {
      currentValue = getActiveFontSize(this.view.state) || '';
      changeHandler = this.handleFontSizeChange;
      width = 'sm';
    } else if (plugin.id === 'font-family') {
      currentValue = getActiveFontFamily(this.view.state) || '';
      changeHandler = this.handleFontFamilyChange;
      width = 'lg';
    } else {
      // Generic fallback
      currentValue = '';
      changeHandler = () => { };
    }

    // Convert options to SelectOption format
    const selectOptions: SelectOption[] = plugin.options.map(opt => ({
      value: opt.value,
      label: opt.label,
    }));

    return (
      <erix-select
        key={plugin.id}
        options={selectOptions}
        value={currentValue}
        selectTitle={plugin.label}
        width={width}
        onErixChange={changeHandler}
      />
    );
  }

  /**
   * Render a dropdown-type plugin (e.g. Table Picker)
   */
  private renderDropdownPlugin(plugin: ToolbarPluginDef) {
    if (!this.view) return null;

    if (plugin.id === 'table') {
      return (
        <erix-dropdown key={plugin.id} triggerTitle={plugin.label}>
          <div slot="trigger">
            <erix-icon name="table" size={18}></erix-icon>
          </div>
          <div slot="menu">
            <erix-table-picker
              onSelectGrid={(e: CustomEvent<{ rows: number; cols: number }>) => {
                this.handleInsertTable(e.detail.rows, e.detail.cols);
              }}
            ></erix-table-picker>
          </div>
        </erix-dropdown>
      );
    }

    return null;
  }

  /**
   * Render toolbar items dynamically
   */
  private renderItems() {
    if (!this.items || this.items.length === 0) {
      return null;
    }

    const elements: any[] = [];
    let lastGroup: string | null = null;
    let currentGroupItems: any[] = [];

    const flushGroup = () => {
      if (currentGroupItems.length > 0) {
        elements.push(
          <div class="toolbar-group" key={`group-${elements.length}`}>
            {currentGroupItems}
          </div>
        );
        currentGroupItems = [];
      }
    };

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      // Handle separator
      if (item === '|' || item === '-') {
        flushGroup();
        lastGroup = null;
        continue;
      }

      // Handle plugin ID
      if (typeof item === 'string') {
        const plugin = this.getPlugin(item);
        if (!plugin) {
          console.warn(`[erix-toolbar] Unknown plugin: ${item}`);
          continue;
        }

        // Check if we need to start a new group (different group from last item)
        if (lastGroup !== null && lastGroup !== plugin.group) {
          flushGroup();
          // Add divider between different groups
          elements.push(<erix-divider key={`divider-${elements.length}`}></erix-divider>);
        }

        // Render based on plugin type
        if (plugin.type === 'select') {
          currentGroupItems.push(this.renderSelectPlugin(plugin));
        } else if (plugin.type === 'dropdown') {
          currentGroupItems.push(this.renderDropdownPlugin(plugin));
        } else {
          currentGroupItems.push(this.renderPluginButton(plugin));
        }
        lastGroup = plugin.group;
      }
    }

    // Flush remaining items
    flushGroup();

    return elements;
  }

  render() {
    return (
      <Host>
        <div class="erix-toolbar">
          {this.renderItems()}

          {/* Spacer to push theme toggle to the right */}
          {this.showThemeToggle && <div class="toolbar-spacer"></div>}

          {/* Theme Toggle - always at the end if enabled */}
          {this.showThemeToggle && (
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
          )}
        </div>
      </Host>
    );
  }
}
