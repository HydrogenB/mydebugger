// This file re-exports components from the design system
import { Button, Card } from "@design-system/components";

// Re-export the components
export { Button, Card };

// We'll use simple direct exports for now until the full component structure is implemented
// Once the display, feedback, inputs, etc. folders are created, we can uncomment these:
/*
export * from '@design-system/components/display';
export * from '@design-system/components/feedback';
export * from '@design-system/components/inputs';
export * from '@design-system/components/layout';
export * from '@design-system/components/navigation';
export * from '@design-system/components/overlays';
export * from '@design-system/components/typography';

// Specific named exports
export { Button } from '@design-system/components/inputs';
export { Card } from '@design-system/components/layout';
export { Alert } from '@design-system/components/feedback';
export { Badge, BadgeContainer } from '@design-system/components/display';
export { Modal } from '@design-system/components/overlays';
export { TabGroup, Tab, TabPanel } from '@design-system/components/navigation';
export { Text } from '@design-system/components/typography';
export { Grid } from '@design-system/components/layout';
*/
