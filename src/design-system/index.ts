// Design System Main Export File

// Export all foundation elements
export * from './foundations/colors';
export * from './foundations/typography';
export * from './foundations/spacing';
export * from './foundations/animations';
export * from './foundations/layout';

// Export all icons
export * from './icons';

// Export context providers and hooks
export { 
  ThemeProvider, 
  useTheme,
  ToastProvider, 
  useToast
} from './context';

// Export components by category
export * from './components/inputs';
export * from './components/layout';
export * from './components/navigation';
export * from './components/feedback';
export * from './components/display';
export * from './components/overlays';
export * from './components/typography';

// Re-export common components for convenience
export { Button } from './components/inputs';
export { Card } from './components/layout';
export { Alert } from './components/feedback';
export { Badge, BadgeContainer } from './components/display';
export { Modal } from './components/overlays';
export { TabGroup, Tab, TabPanel } from './components/navigation';
export { Text } from './components/typography';
export { Grid } from './components/layout';
export { ResponsiveContainer } from './components/layout';
export { Tag } from './components/display';
export { Tooltip } from './components/overlays';