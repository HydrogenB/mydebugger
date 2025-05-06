import React, { useState, useEffect, ReactNode, createContext, useContext } from 'react';

// Context for tab state management
interface TabContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

// Hook for consuming tab context
const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('Tab components must be used within a TabGroup');
  }
  return context;
};

interface TabGroupProps {
  children: ReactNode;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'minimal';
  className?: string;
  ariaLabel?: string;
  stretch?: boolean;
  vertical?: boolean;
}

interface TabProps {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabPanelProps {
  id: string;
  children: ReactNode;
  keepMounted?: boolean;
}

/**
 * TabGroup - Container for a set of tabs and their corresponding content panels
 */
export const TabGroup: React.FC<TabGroupProps> = ({
  children,
  defaultTab,
  onChange,
  variant = 'default',
  className = '',
  ariaLabel = 'Tabs',
  stretch = false,
  vertical = false,
}) => {
  // Find the first tab ID if defaultTab not provided
  const firstTabId = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child) && child.type === Tab)
    .map((child) => React.isValidElement(child) ? child.props.id : '')
    .find(id => id);
    
  const [activeTab, setActiveTab] = useState(defaultTab || firstTabId || '');

  useEffect(() => {
    if (onChange && activeTab) {
      onChange(activeTab);
    }
  }, [activeTab, onChange]);

  // Find tabs and panels among children
  const tabs: React.ReactElement[] = [];
  const panels: React.ReactElement[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    
    if (child.type === Tab) {
      tabs.push(child);
    } else if (child.type === TabPanel) {
      panels.push(child);
    }
  });

  // Styling classes based on variant
  const variantClasses = {
    default: {
      list: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
      tab: 'border-b border-gray-200 dark:border-gray-700 last:border-0',
      activeTab: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
      inactiveTab: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
    },
    pills: {
      list: 'flex space-x-1',
      tab: '',
      activeTab: 'bg-blue-500 text-white',
      inactiveTab: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600',
    },
    underline: {
      list: 'border-b border-gray-200 dark:border-gray-700',
      tab: '',
      activeTab: 'text-blue-600 dark:text-blue-300 border-b-2 border-blue-600 dark:border-blue-400',
      inactiveTab: 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600',
    },
    minimal: {
      list: '',
      tab: '',
      activeTab: 'text-blue-600 dark:text-blue-300 font-medium',
      inactiveTab: 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
    },
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`${vertical ? 'flex' : 'block'} ${className}`}>
        <div 
          className={`
            ${vertical ? 'flex-shrink-0 mr-4' : ''}
            ${variantClasses[variant].list}
            ${vertical ? 'flex-col' : 'flex'}
            ${stretch ? 'w-full' : ''}
          `}
          role="tablist"
          aria-label={ariaLabel}
        >
          {tabs.map((tab) => React.cloneElement(tab, {
            key: tab.props.id,
            className: `
              ${tab.props.className || ''}
              ${variantClasses[variant].tab}
              ${activeTab === tab.props.id 
                ? variantClasses[variant].activeTab 
                : variantClasses[variant].inactiveTab}
              ${vertical ? 'justify-start' : ''}
              ${stretch && !vertical ? 'flex-1' : ''}
            `,
          }))}
        </div>

        <div className={`${vertical ? 'flex-1' : 'mt-4'}`}>
          {panels.map((panel) => React.cloneElement(panel, {
            key: panel.props.id,
            active: activeTab === panel.props.id,
          }))}
        </div>
      </div>
    </TabContext.Provider>
  );
};

/**
 * Tab - Individual tab button
 */
export const Tab: React.FC<TabProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  id,
  label,
  icon,
  badge,
  disabled = false,
  className = '',
  ...props
}) => {
  const { activeTab, setActiveTab } = useTabContext();
  const isActive = activeTab === id;

  return (
    <button
      id={`tab-${id}`}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={`
        flex items-center px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={() => setActiveTab(id)}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
      {badge && (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {badge}
        </span>
      )}
    </button>
  );
};

/**
 * TabPanel - Content panel for a tab
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  id,
  children,
  keepMounted = false,
  active = false,
}) => {
  if (!keepMounted && !active) {
    return null;
  }

  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className={active ? 'animate-fadeIn' : 'hidden'}
    >
      {children}
    </div>
  );
};