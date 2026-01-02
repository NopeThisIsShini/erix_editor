import { Component, Host, h, Prop, Element, Method, Watch } from '@stencil/core';

export type PopoverPlacement = 
  | 'top' 
  | 'top-start' 
  | 'top-end' 
  | 'bottom' 
  | 'bottom-start' 
  | 'bottom-end' 
  | 'left' 
  | 'left-start' 
  | 'left-end' 
  | 'right' 
  | 'right-start' 
  | 'right-end';

/**
 * @component ErixPopover
 * A smart popover component with auto-positioning.
 * Appends content to body for proper positioning.
 * Automatically flips position when there's not enough space.
 */
@Component({
  tag: 'erix-popover',
  styleUrl: 'erix-popover.css',
  shadow: true,
})
export class ErixPopover {
  @Element() el!: HTMLElement;
  
  private portalEl?: HTMLDivElement;
  private contentEl?: HTMLDivElement;

  /**
   * Whether the popover is visible
   */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  /**
   * Preferred placement of the popover
   */
  @Prop() placement: PopoverPlacement = 'top';

  /**
   * Offset distance from the trigger (in pixels)
   */
  @Prop() offset: number = 8;

  /**
   * Whether to auto-flip when there's not enough space
   */
  @Prop() autoFlip: boolean = true;

  /**
   * Anchor element or bounding rect to position relative to
   */
  @Prop() anchorRect?: DOMRect;



  componentWillLoad() {
    // Create portal element that will be appended to body
    this.portalEl = document.createElement('div');
    this.portalEl.className = 'erix-popover-portal';
    this.portalEl.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
    `;
  }

  componentDidLoad() {
    document.body.appendChild(this.portalEl!);
    if (this.open) {
      this.showPopover();
    }
  }

  disconnectedCallback() {
    this.hidePopover();
    this.portalEl?.remove();
  }

  @Watch('open')
  handleOpenChange(newValue: boolean) {
    if (newValue) {
      this.showPopover();
    } else {
      this.hidePopover();
    }
  }

  @Watch('anchorRect')
  handleAnchorChange() {
    if (this.open && this.anchorRect) {
      this.updatePopoverPosition();
    }
  }

  /**
   * Manually trigger a position update
   */
  @Method()
  async updatePosition() {
    if (this.open && this.anchorRect) {
      this.updatePopoverPosition();
    }
  }

  /**
   * Open the popover at a specific anchor rect
   */
  @Method()
  async show(anchorRect?: DOMRect) {
    if (anchorRect) {
      this.anchorRect = anchorRect;
    }
    this.open = true;
  }

  /**
   * Close the popover
   */
  @Method()
  async hide() {
    this.open = false;
  }

  private showPopover() {
    if (!this.portalEl) return;

    // Get slotted content
    const slot = this.el.shadowRoot?.querySelector('slot');
    const slottedNodes = slot?.assignedNodes({ flatten: true }) || [];

    // Create content container
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'erix-popover-content';
    this.contentEl.style.cssText = `
      position: fixed;
      pointer-events: auto;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.12s ease;
      background-color: var(--editor-surface, #ffffff);
      border: 1px solid var(--editor-border, #e2e8f0);
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    `;

    // Clone slotted content into portal
    slottedNodes.forEach(node => {
      this.contentEl!.appendChild(node.cloneNode(true));
    });

    this.portalEl.appendChild(this.contentEl);

    // Calculate position after content is in DOM
    requestAnimationFrame(() => {
      this.updatePopoverPosition();
      // Show with transition
      if (this.contentEl) {
        this.contentEl.style.opacity = '1';
        this.contentEl.style.visibility = 'visible';
      }
    });
  }

  private hidePopover() {
    if (this.contentEl) {
      this.contentEl.remove();
      this.contentEl = undefined;
    }
  }

  private updatePopoverPosition() {
    if (!this.anchorRect || !this.contentEl) return;

    const anchor = this.anchorRect;
    const contentRect = this.contentEl.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let placement = this.placement;

    // Auto-flip logic
    if (this.autoFlip) {
      placement = this.getOptimalPlacement(anchor, contentRect, viewport);
    }

    const pos = this.getPositionForPlacement(anchor, contentRect, placement);
    
    this.contentEl.style.top = `${pos.top}px`;
    this.contentEl.style.left = `${pos.left}px`;

  }

  private getOptimalPlacement(
    anchor: DOMRect,
    content: DOMRect,
    viewport: { width: number; height: number }
  ): PopoverPlacement {
    const space = {
      top: anchor.top,
      bottom: viewport.height - anchor.bottom,
      left: anchor.left,
      right: viewport.width - anchor.right,
    };

    const basePlacement = this.placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
    const alignment = this.placement.split('-')[1] as 'start' | 'end' | undefined;

    let optimalBase = basePlacement;

    // Check if we need to flip
    if (basePlacement === 'top' && space.top < content.height + this.offset) {
      optimalBase = space.bottom >= content.height + this.offset ? 'bottom' : basePlacement;
    } else if (basePlacement === 'bottom' && space.bottom < content.height + this.offset) {
      optimalBase = space.top >= content.height + this.offset ? 'top' : basePlacement;
    } else if (basePlacement === 'left' && space.left < content.width + this.offset) {
      optimalBase = space.right >= content.width + this.offset ? 'right' : basePlacement;
    } else if (basePlacement === 'right' && space.right < content.width + this.offset) {
      optimalBase = space.left >= content.width + this.offset ? 'left' : basePlacement;
    }

    return alignment ? `${optimalBase}-${alignment}` as PopoverPlacement : optimalBase;
  }

  private getPositionForPlacement(
    anchor: DOMRect,
    content: DOMRect,
    placement: PopoverPlacement
  ): { top: number; left: number } {
    const offset = this.offset;
    let top = 0;
    let left = 0;

    const basePlacement = placement.split('-')[0];
    const alignment = placement.split('-')[1];

    // Calculate base position
    switch (basePlacement) {
      case 'top':
        top = anchor.top - content.height - offset;
        left = anchor.left + (anchor.width - content.width) / 2;
        break;
      case 'bottom':
        top = anchor.bottom + offset;
        left = anchor.left + (anchor.width - content.width) / 2;
        break;
      case 'left':
        top = anchor.top + (anchor.height - content.height) / 2;
        left = anchor.left - content.width - offset;
        break;
      case 'right':
        top = anchor.top + (anchor.height - content.height) / 2;
        left = anchor.right + offset;
        break;
    }

    // Apply alignment adjustment
    if (alignment === 'start') {
      if (basePlacement === 'top' || basePlacement === 'bottom') {
        left = anchor.left;
      } else {
        top = anchor.top;
      }
    } else if (alignment === 'end') {
      if (basePlacement === 'top' || basePlacement === 'bottom') {
        left = anchor.right - content.width;
      } else {
        top = anchor.bottom - content.height;
      }
    }

    // Clamp to viewport edges
    const padding = 8;
    left = Math.max(padding, Math.min(left, window.innerWidth - content.width - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - content.height - padding));

    return { top, left };
  }

  render() {
    // The slot is here to receive content, but actual rendering happens in the portal
    return (
      <Host style={{ display: 'none' }}>
        <slot></slot>
      </Host>
    );
  }
}
