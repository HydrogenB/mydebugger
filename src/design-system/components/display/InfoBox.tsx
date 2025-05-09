import React from 'react';
import { Tooltip } from '../overlays/Tooltip';

export type InfoBoxVariant = 'info' | 'success' | 'warning' | 'error';

export interface InfoBoxProps {
  /** Title of the info box */
  title: string;
  /** Content of the info box */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: InfoBoxVariant;
  /** Optional tooltip to show additional information */
  infoTooltip?: React.ReactNode;
  /** Optional icon to show before the title */
  icon?: React.ReactNode;
  /** Whether to show a border */
  bordered?: boolean;
  /** Additional CSS class */
  className?: string;
  /** ID attribute */
  id?: string;
}

/**
 * InfoBox - A component for displaying contextual information and messages with different variants
 * 
 * @description
 * InfoBox is used to communicate important contextual information to users.
 * Different variants provide visual cues about the nature of the information:
 * - info: General information (blue)
 * - success: Success messages and confirmations (green)
 * - warning: Warning messages that require attention (yellow)
 * - error: Error messages and critical information (red)
 * 
 * Each InfoBox displays a title and content, with optional elements like icons
 * and tooltips for additional context.
 * 
 * @accessibility
 * - Uses semantic heading (h4) for the title to maintain document outline
 * - Color combinations meet WCAG contrast requirements in both light and dark modes
 * - Provides visual differentiation beyond just color through borders and backgrounds
 * - Integrates with Tooltip component for additional context when needed
 * - Accepts custom ID for programmatic identification
 * 
 * @example
 * ```tsx
 * // Basic info box
 * <InfoBox title="Information">
 *   This is some helpful information for the user.
 * </InfoBox>
 * 
 * // Warning variant with tooltip
 * <InfoBox 
 *   title="Warning Notice" 
 *   variant="warning"
 *   infoTooltip="More details about this warning"
 * >
 *   This operation has potential side effects.
 * </InfoBox>
 * 
 * // Error variant with custom icon and rich content
 * <InfoBox 
 *   title="Connection Failed" 
 *   variant="error"
 *   icon={<AlertIcon className="h-5 w-5" />}
 * >
 *   <p>Unable to connect to the server.</p>
 *   <ul className="list-disc ml-4 mt-2">
 *     <li>Check your network connection</li>
 *     <li>Verify server status</li>
 *   </ul>
 * </InfoBox>
 * ```
 */
export const InfoBox: React.FC<InfoBoxProps> = ({
  title,
  children,
  variant = 'info',
  infoTooltip,
  icon,
  bordered = true,
  className = '',
  id
}) => {
  // Variant-specific styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return {
          container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          title: 'text-green-800 dark:text-green-300',
          content: 'text-green-700 dark:text-green-200'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          title: 'text-yellow-800 dark:text-yellow-300',
          content: 'text-yellow-700 dark:text-yellow-200'
        };
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          title: 'text-red-800 dark:text-red-300',
          content: 'text-red-700 dark:text-red-200'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          title: 'text-blue-800 dark:text-blue-300',
          content: 'text-blue-700 dark:text-blue-200'
        };
    }
  };

  const styles = getVariantClasses();
  const containerClasses = [
    'p-4 rounded-md',
    bordered ? 'border' : '',
    styles.container,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} id={id}>
      <div className="flex items-center mb-2">
        {icon && <div className="mr-2">{icon}</div>}
        <h4 className={`font-medium ${styles.title}`}>{title}</h4>
        {infoTooltip && (
          <Tooltip content={infoTooltip}>
            <span className="ml-1 cursor-help">ℹ️</span>
          </Tooltip>
        )}
      </div>
      <div className={`text-sm ${styles.content}`}>{children}</div>
    </div>
  );
};

export default InfoBox;