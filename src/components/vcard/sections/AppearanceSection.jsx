import React, { useState, useEffect } from 'react';
import { Button } from '../../../design-system/components/inputs';
import { Card } from '../../../design-system/components/layout';
import { LoadingSpinner } from '../../../design-system/components/feedback';
import { Alert } from '../../../design-system/components/feedback/Alert';

const THEMES = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' }
];

const FONTS = [
  { id: 'Inter', name: 'Inter' },
  { id: 'Roboto', name: 'Roboto' },
  { id: 'Poppins', name: 'Poppins' },
  { id: 'Montserrat', name: 'Montserrat' },
  { id: 'Open Sans', name: 'Open Sans' },
];

const COLOR_PRESETS = [
  { primary: '#3B82F6', secondary: '#10B981', name: 'Blue & Green' },
  { primary: '#F43F5E', secondary: '#8B5CF6', name: 'Red & Purple' },
  { primary: '#6366F1', secondary: '#EC4899', name: 'Indigo & Pink' },
  { primary: '#0EA5E9', secondary: '#F59E0B', name: 'Sky & Amber' },
  { primary: '#14B8A6', secondary: '#8B5CF6', name: 'Teal & Purple' },
];

const AppearanceSection = ({ vcard, onSave }) => {
  const [appearance, setAppearance] = useState({
    theme: 'light',
    font: 'Inter',
    primary: '#3B82F6',
    secondary: '#10B981'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load existing appearance settings
  useEffect(() => {
    if (vcard?.appearances) {
      setAppearance({
        theme: vcard.appearances.theme || 'light',
        font: vcard.appearances.font || 'Inter',
        primary: vcard.appearances.primary || '#3B82F6',
        secondary: vcard.appearances.secondary || '#10B981'
      });
    }
  }, [vcard]);
  
  const handleThemeChange = (theme) => {
    setAppearance({ ...appearance, theme });
  };
  
  const handleFontChange = (font) => {
    setAppearance({ ...appearance, font });
  };
  
  const handleColorChange = (field, value) => {
    setAppearance({ ...appearance, [field]: value });
  };
  
  const handlePresetSelect = (preset) => {
    setAppearance({
      ...appearance,
      primary: preset.primary,
      secondary: preset.secondary
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Update appearance
      await onSave({
        appearances: {
          update: {
            theme: appearance.theme,
            font: appearance.font,
            primary: appearance.primary,
            secondary: appearance.secondary
          }
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error" className="mb-6">{error}</Alert>}
      
      {/* Theme selection */}
      <Card className="p-5 mb-6">
        <h2 className="text-lg font-medium mb-4">Theme</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THEMES.map(theme => (
            <div 
              key={theme.id}
              className={`
                border rounded-md p-4 cursor-pointer transition-all
                ${appearance.theme === theme.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{theme.name}</div>
                {appearance.theme === theme.id && (
                  <div className="text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div 
                className={`mt-3 h-16 rounded-md ${theme.id === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}
              >
                <div 
                  className="h-2 rounded-t-md"
                  style={{ backgroundColor: appearance.primary }}
                ></div>
                <div className="flex justify-center items-center h-14">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: appearance.secondary }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Font selection */}
      <Card className="p-5 mb-6">
        <h2 className="text-lg font-medium mb-4">Font</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FONTS.map(font => (
            <div 
              key={font.id}
              className={`
                border rounded-md p-4 cursor-pointer transition-all
                ${appearance.font === font.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => handleFontChange(font.id)}
              style={{ fontFamily: font.id }}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{font.name}</div>
                {appearance.font === font.id && (
                  <div className="text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </div>
              <div className="text-sm text-gray-600">
                abcdefghijklmnopqrstuvwxyz
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Color selection */}
      <Card className="p-5">
        <h2 className="text-lg font-medium mb-4">Colors</h2>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Color Presets</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {COLOR_PRESETS.map((preset, index) => (
              <button
                key={index}
                type="button"
                className={`
                  border rounded-md p-2 transition-all
                  ${
                    appearance.primary === preset.primary && appearance.secondary === preset.secondary
                      ? 'border-primary-500'
                      : 'border-gray-200'
                  }
                `}
                onClick={() => handlePresetSelect(preset)}
              >
                <div className="flex space-x-2 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  ></div>
                </div>
                <div className="text-xs">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-md"
                style={{ backgroundColor: appearance.primary }}
              ></div>
              <input
                type="color"
                value={appearance.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={appearance.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-md"
                style={{ backgroundColor: appearance.secondary }}
              ></div>
              <input
                type="color"
                value={appearance.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={appearance.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
          <div 
            className={`border rounded-lg overflow-hidden ${appearance.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            style={{ fontFamily: appearance.font }}
          >
            <div 
              className="h-16"
              style={{ backgroundColor: appearance.primary }}
            ></div>
            <div className="p-4">
              <div className="flex justify-center -mt-10 mb-4">
                <div 
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: appearance.secondary }}
                >
                  JD
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">John Doe</h3>
                <p className={`${appearance.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Software Engineer</p>
              </div>
              <div className="mt-4 flex justify-center space-x-3">
                <div 
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: appearance.primary }}
                >
                  Save Contact
                </div>
                <div 
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: appearance.secondary }}
                >
                  Share QR
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Appearance'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AppearanceSection;
