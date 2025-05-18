import React from 'react';
import { Modal } from '../../../design-system/components/overlays';
import { Badge } from '../../../design-system/components/display';
import { Button } from '../../../design-system/components/inputs';
import { Tab, TabPanel, TabGroup } from '../../../design-system/components/navigation';
import { DemoComponent } from '../types';
import { CodeExampleViewer } from './CodeExampleViewer';
import { getCategoryColor } from '../utils';

interface ComponentDetailsProps {
  component: DemoComponent | null;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Modal for displaying component details, usage examples and API
 */
export const ComponentDetails: React.FC<ComponentDetailsProps> = ({
  component,
  onClose,
  isOpen
}) => {
  if (!component) {
    return null;
  }
  
  // Example code snippets - in a real implementation these would be fetched or imported
  const basicExample = {
    title: 'Basic Usage',
    description: `Simple example of the ${component.name} component`,
    code: `import { ${component.name} } from '@/${component.path}';\n\nexport const MyComponent = () => (\n  <${component.name}>${component.name} content</${component.name}>\n);`
  };
  
  const advancedExample = {
    title: 'Advanced Usage',
    description: `More complex example of the ${component.name} component with props`,
    code: `import { ${component.name} } from '@/${component.path}';\n\nexport const MyComponent = () => (\n  <${component.name}\n    prop1="value1"\n    prop2={42}\n    prop3={() => console.log('Hello!')}\n  >\n    ${component.name} with props\n  </${component.name}>\n);`
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={component.name}
      size="lg"
    >
      <div className="mb-4">
        <div className="flex items-center mb-3">
          <Badge className={getCategoryColor(component.category)} size="sm">
            {component.category}
          </Badge>
          <div className="ml-2 text-sm font-mono text-gray-500 dark:text-gray-400">
            @/{component.path}
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300">
          {component.description}
        </p>
      </div>
      
      <TabGroup defaultTab="examples">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <Tab id="examples">Examples</Tab>
          <Tab id="api">API Reference</Tab>
          <Tab id="accessibility">Accessibility</Tab>
        </div>
        
        <TabPanel id="examples">
          <CodeExampleViewer example={basicExample} />
          <CodeExampleViewer example={advancedExample} />
        </TabPanel>
        
        <TabPanel id="api">
          <div className="prose dark:prose-invert max-w-none">
            <h4>Props</h4>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Default</th>
                  <th className="text-left py-2 px-3">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3 font-mono">children</td>
                  <td className="py-2 px-3 font-mono">ReactNode</td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3">The content of the component.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">className</td>
                  <td className="py-2 px-3 font-mono">string</td>
                  <td className="py-2 px-3">''</td>
                  <td className="py-2 px-3">Additional CSS classes to apply.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabPanel>
        
        <TabPanel id="accessibility">
          <div className="prose dark:prose-invert max-w-none">
            <h4>Keyboard Navigation</h4>
            <ul>
              <li>Tab: Moves focus to the component</li>
              <li>Enter/Space: Activates the component (if interactive)</li>
            </ul>
            
            <h4>ARIA Attributes</h4>
            <ul>
              <li><code>aria-label</code>: Provides an accessible name</li>
              <li><code>role</code>: Specifies the component's ARIA role</li>
            </ul>
          </div>
        </TabPanel>
      </TabGroup>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};
