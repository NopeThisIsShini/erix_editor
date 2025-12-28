import { Component, Host, h, Prop, Event, EventEmitter, State } from '@stencil/core';

/**
 * @component ErixStatusBar
 * A Word-like status bar component positioned at the bottom of the editor.
 * Includes zoom controls and theme toggle.
 */
@Component({
    tag: 'erix-status-bar',
    styleUrl: 'erix-status-bar.css',
    shadow: true,
})
export class ErixStatusBar {
    /**
     * Current theme
     */
    @Prop() theme: 'light' | 'dark' | string = 'light';

    /**
     * Current zoom level (percentage, e.g., 100 = 100%)
     */
    @Prop({ mutable: true }) zoom: number = 100;

    /**
     * Minimum zoom level
     */
    @Prop() minZoom: number = 50;

    /**
     * Maximum zoom level
     */
    @Prop() maxZoom: number = 200;

    /**
     * Zoom step for +/- buttons
     */
    @Prop() zoomStep: number = 10;

    /**
     * Event emitted when theme toggle is requested
     */
    @Event() themeToggle: EventEmitter<void>;

    /**
     * Event emitted when zoom level changes
     */
    @Event() zoomChange: EventEmitter<number>;

    /**
     * Internal state for slider value
     */
    @State() private sliderValue: number = 100;

    componentWillLoad() {
        this.sliderValue = this.zoom;
    }

    private handleThemeToggle = () => {
        this.themeToggle.emit();
    };

    private handleZoomIn = () => {
        const newZoom = Math.min(this.zoom + this.zoomStep, this.maxZoom);
        this.updateZoom(newZoom);
    };

    private handleZoomOut = () => {
        const newZoom = Math.max(this.zoom - this.zoomStep, this.minZoom);
        this.updateZoom(newZoom);
    };

    private handleSliderChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const newZoom = parseInt(target.value, 10);
        this.updateZoom(newZoom);
    };

    private updateZoom(value: number) {
        this.zoom = value;
        this.sliderValue = value;
        this.zoomChange.emit(value);
    }

    render() {
        return (
            <Host data-theme={this.theme}>
                <div class="status-bar">
                    {/* Left section - can be extended with page info, word count, etc. */}
                    <div class="status-bar__left">
                        <span class="status-text">Ready</span>
                    </div>

                    {/* Right section - Zoom controls and theme toggle */}
                    <div class="status-bar__right">
                        {/* Zoom controls */}
                        <div class="zoom-controls">
                            {/* Zoom out button */}
                            <button
                                class="zoom-btn"
                                title="Zoom Out"
                                onClick={this.handleZoomOut}
                                disabled={this.zoom <= this.minZoom}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </button>

                            {/* Zoom slider */}
                            <input
                                type="range"
                                class="zoom-slider"
                                min={this.minZoom}
                                max={this.maxZoom}
                                value={this.sliderValue}
                                onInput={this.handleSliderChange}
                                title={`Zoom: ${this.zoom}%`}
                            />

                            {/* Zoom in button */}
                            <button
                                class="zoom-btn"
                                title="Zoom In"
                                onClick={this.handleZoomIn}
                                disabled={this.zoom >= this.maxZoom}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </button>

                            {/* Zoom percentage display */}
                            <span class="zoom-value">{this.zoom}%</span>
                        </div>

                        {/* Divider */}
                        <div class="status-divider"></div>

                        {/* Theme toggle */}
                        <button
                            class="theme-btn"
                            title={this.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            onClick={this.handleThemeToggle}
                        >
                            {this.theme === 'light' ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.026 17.001c-2.762 4.784-8.879 6.423-13.663 3.661a9.964 9.964 0 0 1-3.234-2.983.75.75 0 0 1 .365-1.131c3.767-1.348 5.785-2.911 6.956-5.146 1.232-2.353 1.551-4.93.689-8.464a.75.75 0 0 1 .769-.926 9.961 9.961 0 0 1 4.457 1.327C21.149 6.1 22.788 12.217 20.025 17Zm-8.248-4.903c-1.25 2.388-3.31 4.099-6.817 5.499a8.492 8.492 0 0 0 2.152 1.766 8.501 8.501 0 1 0 8.502-14.725 8.485 8.485 0 0 0-2.792-1.016c.647 3.384.23 6.044-1.045 8.476Z" fill="currentColor" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.996 19.01a.75.75 0 0 1 .743.649l.007.102v1.5a.75.75 0 0 1-1.493.101l-.007-.101v-1.5a.75.75 0 0 1 .75-.75Zm6.022-2.072 1.06 1.06a.75.75 0 1 1-1.06 1.061l-1.06-1.06a.75.75 0 0 1 1.06-1.061Zm-10.983 0a.75.75 0 0 1 0 1.06L5.974 19.06a.75.75 0 0 1-1.06-1.06l1.06-1.061a.75.75 0 0 1 1.06 0ZM12 6.475a5.525 5.525 0 1 1 0 11.05 5.525 5.525 0 0 1 0-11.05Zm0 1.5a4.025 4.025 0 1 0 0 8.05 4.025 4.025 0 0 0 0-8.05Zm9.25 3.293a.75.75 0 0 1 .102 1.493l-.102.007h-1.5a.75.75 0 0 1-.102-1.493l.102-.007h1.5Zm-17-.029a.75.75 0 0 1 .102 1.494l-.102.006h-1.5a.75.75 0 0 1-.102-1.493l.102-.007h1.5Zm1.64-6.37.084.072 1.06 1.06a.75.75 0 0 1-.976 1.134l-.084-.073-1.06-1.06a.75.75 0 0 1 .976-1.134Zm13.188.072a.75.75 0 0 1 .073.977l-.073.084-1.06 1.06a.75.75 0 0 1-1.133-.976l.072-.084 1.06-1.061a.75.75 0 0 1 1.061 0ZM12 1.99a.75.75 0 0 1 .743.648l.007.102v1.5a.75.75 0 0 1-1.493.101l-.007-.102v-1.5a.75.75 0 0 1 .75-.75Z" fill="currentColor" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </Host>
        );
    }
}
