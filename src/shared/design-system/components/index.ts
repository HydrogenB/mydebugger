// Components index - automatically exports all components by category

// Export component categories
export * from './display';
export * from './feedback';
export * from './inputs';
export * from './layout';
export * from './navigation';
export * from './overlays';
export * from './typography';

// Re-export common components for convenience
export { Button } from './inputs';
export { Card } from './layout';
export { Alert } from './feedback';
export { Badge, BadgeContainer } from './display';
export { Modal } from './overlays';
export { TabGroup, Tab, TabPanel } from './navigation';
export { Text } from './typography';
export { Grid } from './layout';
