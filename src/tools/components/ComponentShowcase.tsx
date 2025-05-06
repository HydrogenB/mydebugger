import React, { useState } from 'react';
import Button from './Button';
import ButtonGroup from './ButtonGroup';
import TextInput from './TextInput';
import Card from './Card';

/**
 * A showcase page that displays all available button variants, text inputs, and other components
 * This component helps demonstrate the various states and configurations of UI components.
 */
const ComponentShowcase: React.FC = () => {
  const [textValue, setTextValue] = useState('');
  const [toggleState, setToggleState] = useState(false);
  
  // Icons for demonstration
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
  
  const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
  
  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Component Showcase</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A demonstration of all available UI components with their variants and states
        </p>
      </div>
      
      {/* Buttons Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">Buttons</h2>
        
        {/* Regular Button Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Standard Button Variants</h3>
          <div className="flex flex-wrap items-start gap-4">
            <Button>Default Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="light">Light</Button>
            <Button variant="dark">Dark</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>
        
        {/* Outlined Button Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Outlined Button Variants</h3>
          <div className="flex flex-wrap items-start gap-4">
            <Button variant="outline-primary">Outline Primary</Button>
            <Button variant="outline-secondary">Outline Secondary</Button>
            <Button variant="outline-success">Outline Success</Button>
            <Button variant="outline-danger">Outline Danger</Button>
            <Button variant="outline-warning">Outline Warning</Button>
            <Button variant="outline-info">Outline Info</Button>
            <Button variant="outline-light">Outline Light</Button>
            <Button variant="outline-dark">Outline Dark</Button>
          </div>
        </div>

        {/* Text Button Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Text Button Variants</h3>
          <div className="flex flex-wrap items-start gap-4">
            <Button variant="text-primary">Text Primary</Button>
            <Button variant="text-secondary">Text Secondary</Button>
            <Button variant="text-success">Text Success</Button>
            <Button variant="text-danger">Text Danger</Button>
            <Button variant="text-warning">Text Warning</Button>
            <Button variant="text-info">Text Info</Button>
          </div>
        </div>

        {/* Button Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Button Sizes</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button>Medium (Default)</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </div>

        {/* Icon Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Icon Buttons</h3>
          <div className="flex flex-wrap items-start gap-4">
            <Button icon={<SearchIcon />}>Search</Button>
            <Button icon={<PlusIcon />} variant="success">Add New</Button>
            <Button rightIcon={<ArrowRightIcon />} variant="info">Next</Button>
            <Button icon={<CheckIcon />} iconPosition="right" variant="outline-success">Complete</Button>
            <Button icon={<PlusIcon />} aria-label="Add" className="!p-2">
              <span className="sr-only">Add Item</span>
            </Button>
          </div>
        </div>

        {/* Button States */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Button States</h3>
          <div className="flex flex-wrap items-start gap-4">
            <Button disabled>Disabled</Button>
            <Button isLoading>Loading</Button>
            <Button isLoading loadingText="Submitting...">Submit</Button>
            <Button active>Active State</Button>
            <Button elevated>Elevated</Button>
            <Button fullWidth>Full Width Button</Button>
          </div>
        </div>

        {/* Button Group */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Button Groups</h3>
          
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Horizontal Button Group (Default)</p>
              <ButtonGroup>
                <Button>Left</Button>
                <Button>Middle</Button>
                <Button>Right</Button>
              </ButtonGroup>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Attached Button Group</p>
              <ButtonGroup attached variant="outline-primary">
                <Button icon={<PlusIcon />}>Add</Button>
                <Button>Edit</Button>
                <Button variant="danger">Delete</Button>
              </ButtonGroup>
            </div>

            <div className="flex gap-4">
              <div>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Vertical Group</p>
                <ButtonGroup orientation="vertical" variant="secondary" size="sm">
                  <Button>Top</Button>
                  <Button>Middle</Button>
                  <Button>Bottom</Button>
                </ButtonGroup>
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Attached Vertical</p>
                <ButtonGroup orientation="vertical" attached>
                  <Button>First</Button>
                  <Button>Second</Button>
                  <Button>Third</Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
        </div>
        
        {/* Button Radius */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Button Border Radius</h3>
          <div className="flex flex-wrap items-start gap-4">
            <Button radius="none">Square Corners</Button>
            <Button radius="sm" variant="info">Small Radius</Button>
            <Button radius="md" variant="success">Medium Radius (Default)</Button>
            <Button radius="lg" variant="warning">Large Radius</Button>
            <Button radius="full" variant="danger">Fully Rounded</Button>
          </div>
        </div>
      </section>

      {/* Text Inputs Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">Text Inputs</h2>
        
        {/* Standard Input Variants */}
        <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default Variant */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Default Style</h3>
            <TextInput 
              label="Default Input" 
              placeholder="Enter text here..." 
              fullWidth
            />
            <TextInput 
              label="With Helper Text" 
              placeholder="Enter text here..." 
              helperText="This is helper text to provide more context"
              fullWidth
            />
            <TextInput 
              label="With Error" 
              placeholder="Enter text here..." 
              error="This field is required"
              fullWidth
            />
            <TextInput 
              label="Success State" 
              value="Valid input" 
              success
              fullWidth
            />
            <TextInput 
              label="Required Field" 
              placeholder="This field is required" 
              required
              fullWidth
            />
            <TextInput 
              label="Disabled Input" 
              value="Disabled content" 
              disabled
              fullWidth
            />
          </div>

          {/* Filled Variant */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Filled Style</h3>
            <TextInput 
              variant="filled"
              label="Filled Input" 
              placeholder="Enter text here..." 
              fullWidth
            />
            <TextInput
              variant="filled" 
              label="With Helper Text" 
              placeholder="Enter text here..." 
              helperText="This is helper text to provide more context"
              fullWidth
            />
            <TextInput 
              variant="filled"
              label="With Error" 
              placeholder="Enter text here..." 
              error="This field is required"
              fullWidth
            />
            <TextInput 
              variant="filled"
              label="Success State" 
              value="Valid input" 
              success
              fullWidth
            />
          </div>

          {/* Outlined Variant */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Outlined Style</h3>
            <TextInput 
              variant="outlined"
              label="Outlined Input" 
              placeholder="Enter text here..." 
              fullWidth
            />
            <TextInput 
              variant="outlined"
              label="With Helper Text" 
              placeholder="Enter text here..." 
              helperText="This is helper text to provide more context"
              fullWidth
            />
            <TextInput 
              variant="outlined"
              label="With Error" 
              placeholder="Enter text here..." 
              error="This field is required"
              fullWidth
            />
          </div>

          {/* Underlined Variant */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Underlined Style</h3>
            <TextInput 
              variant="underlined"
              label="Underlined Input" 
              placeholder="Enter text here..." 
              fullWidth
            />
            <TextInput 
              variant="underlined"
              label="With Helper Text" 
              placeholder="Enter text here..." 
              helperText="This is helper text to provide more context"
              fullWidth
            />
            <TextInput 
              variant="underlined"
              label="With Error" 
              placeholder="Enter text here..." 
              error="This field is required"
              fullWidth
            />
          </div>
        </div>

        {/* Input Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Input Sizes</h3>
          <div className="flex flex-col gap-4">
            <TextInput 
              size="sm"
              label="Small Input" 
              placeholder="Small size" 
            />
            <TextInput 
              label="Medium Input (Default)" 
              placeholder="Medium size" 
            />
            <TextInput 
              size="lg"
              label="Large Input" 
              placeholder="Large size" 
            />
          </div>
        </div>

        {/* Input with Adornments */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Input with Adornments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput 
              label="With Start Adornment" 
              placeholder="Search..." 
              startAdornment={<SearchIcon />}
              fullWidth
            />
            <TextInput 
              label="With End Adornment" 
              placeholder="Enter amount" 
              endAdornment={<span>$</span>}
              fullWidth
            />
            <TextInput 
              label="With Both Adornments" 
              placeholder="Filter..." 
              startAdornment={<SearchIcon />}
              endAdornment={<ArrowRightIcon />}
              fullWidth
            />
            <TextInput 
              label="Clearable Input" 
              placeholder="Type to see clear button" 
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              clearable
              fullWidth
            />
          </div>
        </div>

        {/* Character Count */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Character Count</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput 
              label="With Character Count" 
              placeholder="Type to see counter..." 
              showCharCount
              fullWidth
            />
            <TextInput 
              label="With Max Length" 
              placeholder="Limited to 50 characters" 
              maxLength={50}
              showCharCount
              fullWidth
            />
          </div>
        </div>
      </section>

      {/* Usage Examples Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">Usage Examples</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Example */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Login Form Example</h3>
            <form className="space-y-6">
              <TextInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                startAdornment={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                }
                required
                fullWidth
              />
              <TextInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                startAdornment={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                }
                required
                fullWidth
              />
              <div className="pt-2">
                <Button variant="primary" fullWidth>
                  Sign In
                </Button>
              </div>
            </form>
          </Card>

          {/* Action Buttons Example */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Responsive Action Buttons</h3>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">Data saved successfully.</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline-primary" icon={<ArrowRightIcon />} fullWidth>
                  Continue
                </Button>
                <Button variant="success" icon={<CheckIcon />} fullWidth>
                  Save Changes
                </Button>
              </div>

              <div className="mt-4">
                <ButtonGroup attached fullWidth>
                  <Button variant="light">Cancel</Button>
                  <Button variant="primary">Submit</Button>
                </ButtonGroup>
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="text-danger" size="sm">
                  Delete
                </Button>
                <Button variant="text-primary" size="sm">
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ComponentShowcase;