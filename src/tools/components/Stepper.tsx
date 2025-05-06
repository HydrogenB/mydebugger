import React, { ReactNode } from 'react';

export type StepStatus = 'completed' | 'current' | 'upcoming' | 'error';
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperSize = 'sm' | 'md' | 'lg';

export interface StepperProps {
  /** Steps to display */
  children: ReactNode;
  /** Direction of the stepper */
  orientation?: StepperOrientation;
  /** Index of the active step (0-based) */
  activeStep: number;
  /** Size of the stepper */
  size?: StepperSize;
  /** Whether to alternate step text positions (above & below for horizontal) */
  alternating?: boolean;
  /** CSS class for the stepper */
  className?: string;
  /** Whether to show the connector lines between steps */
  showConnectors?: boolean;
  /** Custom component for connectors */
  connector?: ReactNode;
}

export interface StepProps {
  /** Step label text */
  label: ReactNode;
  /** Optional step description */
  description?: ReactNode;
  /** Optional icon to override the default number */
  icon?: ReactNode;
  /** Status of the step */
  status?: StepStatus;
  /** Whether the step is optional */
  optional?: boolean;
  /** Custom CSS class for the step */
  className?: string;
  /** Click handler for the step */
  onClick?: () => void;
  /** Hover title attribute for the step */
  title?: string;
}

/**
 * Step component for use within Stepper
 */
export const Step: React.FC<StepProps> = ({
  label,
  description,
  icon,
  status = 'upcoming',
  optional = false,
  className = '',
  onClick,
  title,
}) => {
  // This component itself doesn't render anything directly
  // It's used as a composition pattern by Stepper
  return null;
};

/**
 * Stepper component for displaying progress through multi-step processes
 */
const Stepper: React.FC<StepperProps> = ({
  children,
  orientation = 'horizontal',
  activeStep,
  size = 'md',
  alternating = false,
  className = '',
  showConnectors = true,
  connector,
}) => {
  // Convert React children to array and filter for Step components
  const steps = React.Children.toArray(children)
    .filter(step => React.isValidElement(step) && 
      step.type === Step) as React.ReactElement<StepProps>[];

  // Determine the status for each step
  const stepsWithStatus = steps.map((step, index) => {
    let status: StepStatus = step.props.status || 'upcoming';
    
    if (index === activeStep) {
      status = 'current';
    } else if (index < activeStep) {
      status = 'completed';
    } else if (index > activeStep) {
      status = 'upcoming';
    }
    
    return React.cloneElement(step, { status });
  });

  // Size classes for icons and text
  const sizeClasses = {
    sm: {
      icon: 'w-6 h-6',
      text: 'text-xs',
      line: 'h-0.5',
    },
    md: {
      icon: 'w-8 h-8',
      text: 'text-sm',
      line: 'h-0.5',
    },
    lg: {
      icon: 'w-10 h-10',
      text: 'text-base',
      line: 'h-1',
    },
  };

  // Style classes for different statuses
  const statusClasses = {
    completed: {
      icon: 'bg-blue-600 dark:bg-blue-500 text-white',
      text: 'text-gray-900 dark:text-gray-100',
      line: 'bg-blue-600 dark:bg-blue-500',
    },
    current: {
      icon: 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900',
      text: 'text-blue-600 dark:text-blue-400 font-medium',
      line: 'bg-gray-300 dark:bg-gray-700',
    },
    upcoming: {
      icon: 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
      text: 'text-gray-500 dark:text-gray-400',
      line: 'bg-gray-300 dark:bg-gray-700',
    },
    error: {
      icon: 'bg-red-600 dark:bg-red-500 text-white',
      text: 'text-red-600 dark:text-red-400',
      line: 'bg-red-600 dark:bg-red-500',
    },
  };

  // Render the check icon for completed steps
  const renderCheckIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  // Render error icon for steps with errors
  const renderErrorIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm0-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  // Render the icon for each step
  const renderStepIcon = (step: React.ReactElement<StepProps>, index: number) => {
    const { status, icon } = step.props;

    // Custom icon if provided
    if (icon) {
      return icon;
    }

    // Status based icons
    if (status === 'completed') {
      return renderCheckIcon();
    }

    if (status === 'error') {
      return renderErrorIcon();
    }

    // Default to step number
    return <span>{index + 1}</span>;
  };

  // Render connector line between steps
  const renderConnector = (index: number) => {
    // Don't render connector for the last step
    if (index >= stepsWithStatus.length - 1) {
      return null;
    }

    // Determine connector status - it gets the status of the earlier step
    const connectorStatus = index < activeStep ? 'completed' : 
                          index === activeStep ? 'current' : 'upcoming';

    // Custom connector or default line
    const connectorElement = connector || (
      <div 
        className={`flex-1 ${statusClasses[connectorStatus].line} ${
          orientation === 'horizontal' ? `${sizeClasses[size].line} mx-1` : 'w-0.5 my-1'
        }`}
      />
    );

    return showConnectors ? connectorElement : null;
  };

  // Main container class based on orientation
  const containerClass = `
    flex 
    ${orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col'}
    ${className}
  `;

  return (
    <div className={containerClass.trim()}>
      {stepsWithStatus.map((step, index) => {
        const { label, description, status, optional, onClick, title, className: stepClassName = '' } = step.props;
        const isClickable = !!onClick;

        return (
          <React.Fragment key={index}>
            {/* Step container */}
            <div 
              className={`
                flex ${orientation === 'horizontal' ? 'flex-col items-center' : 'flex-row items-start'}
                ${alternating && orientation === 'horizontal' && index % 2 === 1 ? 'flex-col-reverse' : ''}
                ${stepClassName}
              `}
            >
              {/* Step Icon */}
              <div 
                className={`
                  flex items-center justify-center
                  rounded-full ${statusClasses[status].icon} ${sizeClasses[size].icon}
                  ${isClickable ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2' : ''}
                `}
                onClick={onClick}
                title={title}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
              >
                {renderStepIcon(step, index)}
              </div>

              {/* Step Content */}
              <div 
                className={`
                  flex flex-col 
                  ${orientation === 'horizontal' ? 'mt-2 text-center' : 'ml-3'}
                  ${alternating && orientation === 'horizontal' && index % 2 === 1 ? 'mb-2 mt-0' : ''}
                `}
              >
                <div className={`${statusClasses[status].text} ${sizeClasses[size].text}`}>
                  {label}
                </div>
                
                {optional && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Optional
                  </div>
                )}
                
                {description && (
                  <div className={`text-gray-500 dark:text-gray-400 ${sizeClasses[size].text === 'text-xs' ? 'text-xs' : 'text-sm'} mt-1`}>
                    {description}
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            {orientation === 'horizontal' ? (
              // Horizontal connector
              renderConnector(index)
            ) : (
              // Vertical connector with wrapper for alignment
              <div className="flex flex-row items-stretch ml-4">
                {renderConnector(index)}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;