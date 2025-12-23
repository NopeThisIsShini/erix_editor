/**
 * @fileoverview Type definitions for the ErixButton component
 */

export type ButtonVariant = 'default' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ErixButtonProps {
  /**
   * Whether the button is in an active/pressed state
   */
  active?: boolean;
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * The visual style variant of the button
   */
  variant?: ButtonVariant;
  
  /**
   * The size of the button
   */
  size?: ButtonSize;
  
  /**
   * Tooltip text for the button
   */
  title?: string;
}
