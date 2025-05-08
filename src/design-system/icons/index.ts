// Emoji-based icon system
// This provides a consistent set of icons using emojis

export type IconName = 
  // UI icons
  | 'close' 
  | 'check'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'add'
  | 'remove'
  | 'edit'
  | 'delete'
  | 'search'
  | 'settings'
  | 'menu'
  | 'user'
  | 'home'
  | 'calendar'
  | 'clock'
  | 'star'
  | 'heart'
  | 'lock'
  | 'unlock'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'sun'
  | 'moon'
  | 'xMark' // Added for Toast error icon
  // Domain-specific icons
  | 'security'
  | 'database'
  | 'network'
  | 'web'
  | 'code'
  | 'api'
  | 'test'
  | 'bug'
  | 'link'
  | 'document'
  | 'tool'; // Added for tool icon

const icons: Record<IconName, string> = {
  // UI icons
  'close': '✖️',
  'check': '✓',
  'info': 'ℹ️',
  'warning': '⚠️',
  'error': '❌',
  'success': '✅',
  'add': '➕',
  'remove': '➖',
  'edit': '✏️',
  'delete': '🗑️',
  'search': '🔍',
  'settings': '⚙️',
  'menu': '☰',
  'user': '👤',
  'home': '🏠',
  'calendar': '📅',
  'clock': '🕒',
  'star': '⭐',
  'heart': '❤️',
  'lock': '🔒',
  'unlock': '🔓',
  'download': '⬇️',
  'upload': '⬆️',
  'refresh': '🔄',
  'arrow-up': '↑',
  'arrow-down': '↓',
  'arrow-left': '←',
  'arrow-right': '→',
  'sun': '☀️',
  'moon': '🌙',
  'xMark': '❌', // Added for Toast error icon (using the same emoji as 'error' for consistency)
  // Domain-specific icons
  'security': '🔐',
  'database': '🗄️',
  'network': '🌐',
  'web': '🕸️',
  'code': '🧩',
  'api': '🔌',
  'test': '🧪',
  'bug': '🐞',
  'link': '🔗',
  'document': '📄',
  'tool': '🔧' // Added for tool icon
};

/**
 * Get an emoji icon by name
 * @param name Name of the icon to retrieve
 * @returns The corresponding emoji
 */
export const getIcon = (name: IconName): string => {
  return icons[name] || '❓';
};

// Helper types for component props that accept icons
export type IconProp = IconName | React.ReactNode;

/**
 * Process an icon prop that could be either an emoji name or a React node
 * @param icon The icon prop to process
 * @returns The processed icon as a React node
 */
export const processIconProp = (icon: IconProp): React.ReactNode => {
  if (typeof icon === 'string') {
    return getIcon(icon as IconName);
  }
  return icon;
};