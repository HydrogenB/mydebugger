import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

// Types
type TabVariant = 'underlined' | 'pills' | 'boxed' | 'buttons';
type TabSize = 'sm' | 'md' | 'lg';
type TabAlignment = 'left' | 'center' | 'right' | 'fullWidth';

// Context type
type TabContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: TabVariant;
  size: TabSize;
  alignment: TabAlignment;
};

// Create tab context
const TabContext = createContext<TabContextType | undefined>(undefined);

// Properties
export interface TabGroupProps {
  /** ID for the tab group */
  id?: string;
  /** Default active tab */
  defaultTab?: string;
  /** Tab variant style */
  variant?: TabVariant;
  /** Size of the tabs */
  size?: TabSize;
  /** Tab alignment */
  alignment?: TabAlignment;
  /** Whether to animate indicator */
  animateIndicator?: boolean;
  /** Custom class for the tab list */
  className?: string;
  /** Children tabs & panels */
  children: React.ReactNode;
  /** Allow manual control of active tab */
  activeTab?: string;
  /** Callback when tab changes */
  onChange?: (id: string) => void;
}

export interface TabItemProps {
  /** Unique ID for the tab */
  id: string;
  /** Tab label */
  label: React.ReactNode;
  /** Icon to show before label */
  icon?: React.ReactNode;
  /** Badge content */
  badge?: React.ReactNode;
  /** Whether tab is disabled */
  disabled?: boolean;
  /** Custom classes */
  className?: string;
}

export interface TabPanelProps {
  /** ID matching the tab */
  id: string;
  /** Panel content */
  children: React.ReactNode;
  /** Whether to keep unmounted tabs in DOM */
  keepMounted?: boolean;
  /** When true, this panel is active */
  active?: boolean;
}

/**
 * TabGroup - A component that organizes content into multiple selectable tabs
 * 
 * @description
 * TabGroup organizes content into multiple tabs, showing one panel at a time.
 * This component improves UI organization for complex interfaces by separating
 * content into logical sections that users can switch between. TabGroup supports
 * different visual styles, sizes, and alignments to match design requirements.
 * 
 * TabGroup consists of Tab components for navigation and TabPanel components for content,
 * and can be controlled (external state) or uncontrolled (internal state).
 * 
 * @accessibility
 * - Implements ARIA roles (tablist, tab, tabpanel) for proper screen reader navigation
 * - Manages keyboard focus and tabIndex for keyboard navigation
 * - Includes proper ARIA relationships between tabs and panels
 * - Provides visible active states with appropriate color contrast
 * - Supports disabled tabs with proper styling and ARIA attributes
 * - Includes smooth animations with reduced motion support
 * 
 * @example
 * ```tsx
 * // Basic tab group
 * <TabGroup>
 *   <Tab id="tab1" label="Details" />
 *   <Tab id="tab2" label="Settings" />
 *   <Tab id="tab3" label="History" disabled />
 *   
 *   <TabPanel id="tab1">
 *     <p>Details content goes here</p>
 *   </TabPanel>
 *   <TabPanel id="tab2">
 *     <p>Settings content goes here</p>
 *   </TabPanel>
 *   <TabPanel id="tab3">
 *     <p>History content goes here</p>
 *   </TabPanel>
 * </TabGroup>
 * 
 * // Custom styled tab group
 * <TabGroup 
 *   variant="pills" 
 *   size="lg"
 *   alignment="center"
 *   defaultTab="settings"
 * >
 *   <Tab id="account" label="Account" icon={<UserIcon />} />
 *   <Tab id="settings" label="Settings" icon={<GearIcon />} />
 *   <TabPanel id="account">{accountContent}</TabPanel>
 *   <TabPanel id="settings">{settingsContent}</TabPanel>
 * </TabGroup>
 * 
 * // Controlled tab group
 * const [activeTab, setActiveTab] = useState("tab1");
 * 
 * <TabGroup 
 *   activeTab={activeTab} 
 *   onChange={setActiveTab}
 * >
 *   {tabs.map(tab => (
 *     <Tab key={tab.id} id={tab.id} label={tab.label} />
 *   ))}
 *   
 *   {tabs.map(tab => (
 *     <TabPanel key={tab.id} id={tab.id}>
 *       {tab.content}
 *     </TabPanel>
 *   ))}
 * </TabGroup>
 * ```
 */
export const TabGroup: React.FC<TabGroupProps> = ({
  id = 'tab-group',
  defaultTab,
  variant = 'underlined',
  size = 'md',
  alignment = 'left',
  animateIndicator = true,
  className = '',
  children,
  activeTab: controlledActiveTab,
  onChange,
}) => {
  // Find the ID of the first non-disabled tab for the default tab
  const getFirstEnabledTabId = (): string | undefined => {
    let firstTabId: string | undefined;
  
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === Tab && !child.props.disabled && !firstTabId) {
        firstTabId = child.props.id;
      }
    });
  
    return firstTabId;
  };

  // Initialize active tab state
  const [internalActiveTab, setInternalActiveTab] = useState<string>(() => {
    // If there's a controlled value or default, use it, otherwise find first enabled tab
    return controlledActiveTab || defaultTab || getFirstEnabledTabId() || '';
  });
  
  // Get actual active tab (controlled or internal)
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  
  // Handle active tab change
  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    
    if (onChange) {
      onChange(tabId);
    }
  };
  
  // Update internal state when controlled value changes
  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setInternalActiveTab(controlledActiveTab);
    }
  }, [controlledActiveTab]);

  // Prepare context value
  const contextValue: TabContextType = {
    activeTab,
    setActiveTab: handleTabChange,
    variant,
    size,
    alignment
  };

  // Filter and organize children into tabs and panels
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

  // Tab list classes based on variant and alignment
  const getTabListClasses = () => {
    const classes = [
      'flex relative',
      className,
    ];
    
    // Alignment classes
    switch (alignment) {
      case 'center':
        classes.push('justify-center');
        break;
      case 'right':
        classes.push('justify-end');
        break;
      case 'fullWidth':
        classes.push('w-full');
        break;
      default: // left
        classes.push('justify-start');
    }
    
    // Variant-specific classes
    switch (variant) {
      case 'pills':
        classes.push('gap-2 p-1');
        break;
      case 'boxed':
        classes.push('rounded-md border border-gray-200 dark:border-gray-700 gap-0 p-0');
        break;
      case 'buttons':
        classes.push('gap-1 p-0');
        break;
      default: // underlined
        classes.push('border-b border-gray-200 dark:border-gray-700 gap-4');
    }
    
    return classes.filter(Boolean).join(' ');
  };

  return (
    <TabContext.Provider value={contextValue}>
      <div id={id} className="w-full">
        {/* Tab list */}
        <div
          role="tablist"
          aria-label={id}
          className={getTabListClasses()}
        >
          {tabs}
        </div>
        
        {/* Tab panels */}
        <div className="mt-4">
          {panels}
        </div>
      </div>
    </TabContext.Provider>
  );
};

/**
 * Tab - Individual selectable tab button within a TabGroup
 * 
 * @description
 * Tab represents a single selectable option within a TabGroup.
 * When selected, it displays its corresponding TabPanel content.
 * 
 * Tabs can include text labels, icons, and status badges, and can be
 * enabled or disabled based on application needs.
 * 
 * @example
 * ```tsx
 * // Basic tab
 * <Tab id="profile" label="User Profile" />
 * 
 * // Tab with icon and badge
 * <Tab 
 *   id="notifications" 
 *   label="Notifications" 
 *   icon={<BellIcon />} 
 *   badge={<Badge>3</Badge>}
 * />
 * 
 * // Disabled tab
 * <Tab id="admin" label="Admin Settings" disabled />
 * ```
 */
export const Tab: React.FC<TabItemProps> = ({
  id,
  label,
  icon,
  badge,
  disabled = false,
  className = '',
}) => {
  // Get tab context
  const context = useContext(TabContext);
  
  if (!context) {
    throw new Error('Tab must be used within a TabGroup');
  }
  
  const { activeTab, setActiveTab, variant, size, alignment } = context;
  const isActive = activeTab === id;
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = () => {
    if (!disabled) {
      setActiveTab(id);
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base py-2 px-3',
    lg: 'text-lg py-2 px-4',
  };
  
  // Get classes based on variant
  const getTabClasses = () => {
    const classes = [
      'focus:outline-none transition-all duration-200 motion-reduce:transition-none font-medium',
      sizeClasses[size],
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      className,
    ];
    
    if (alignment === 'fullWidth') {
      classes.push('flex-1 text-center');
    }
    
    switch (variant) {
      case 'pills':
        classes.push(
          'rounded-md transform transition-transform duration-150 motion-reduce:transform-none',
          isActive
            ? 'bg-primary-600 text-white dark:bg-primary-500 shadow-sm scale-105'
            : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95'
        );
        break;
        
      case 'boxed':
        classes.push(
          'transition-colors duration-200 motion-reduce:transition-none',
          isActive
            ? 'bg-white dark:bg-gray-800 border-b-2 border-primary-500 dark:border-primary-400'
            : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-750'
        );
        
        if (alignment === 'fullWidth') {
          classes.push(
            'first:rounded-tl-md last:rounded-tr-md border-r border-gray-200 dark:border-gray-700 last:border-r-0'
          );
        }
        break;
        
      case 'buttons':
        classes.push(
          'border rounded-md transform transition-transform duration-150 motion-reduce:transform-none',
          isActive
            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-500 text-primary-700 dark:text-primary-300 shadow-sm'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95'
        );
        break;
        
      default: // underlined
        classes.push(
          'pb-2 border-b-2 transition-all duration-200 motion-reduce:transition-none',
          isActive
            ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 hover:border-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-600'
        );
    }
    
    return classes.filter(Boolean).join(' ');
  };
  
  return (
    <button
      ref={buttonRef}
      id={`tab-${id}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      tabIndex={isActive ? 0 : -1}
      className={getTabClasses()}
      onClick={handleClick}
      disabled={disabled}
    >
      <div className="flex items-center">
        {icon && <span className="mr-2 transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transform-none">{icon}</span>}
        {label}
        {badge && (
          <span className="ml-2 transition-transform duration-200 motion-reduce:transform-none">{badge}</span>
        )}
      </div>
    </button>
  );
};

/**
 * TabPanel - Content container that corresponds to a Tab
 * 
 * @description
 * TabPanel contains the content associated with a specific Tab.
 * It's shown when its corresponding tab is active and hidden otherwise.
 * 
 * TabPanels can optionally be kept mounted in the DOM even when hidden,
 * which preserves state but may impact performance.
 * 
 * @example
 * ```tsx
 * <TabPanel id="profile">
 *   <UserProfileForm />
 * </TabPanel>
 * 
 * <TabPanel id="settings" keepMounted>
 *   <SettingsForm />
 * </TabPanel>
 * ```
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  id,
  children,
  keepMounted = false,
  active = false,
}) => {
  // Get tab context
  const context = useContext(TabContext);
  
  if (!context) {
    throw new Error('TabPanel must be used within a TabGroup');
  }
  
  const { activeTab } = context;
  const isActive = activeTab === id || active;
  
  if (!keepMounted && !isActive) {
    return null;
  }

  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className={isActive ? 'animate-fadeIn motion-reduce:animate-none' : 'hidden'}
      tabIndex={0}
    >
      {children}
    </div>
  );
};