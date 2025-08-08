# Translation System Guide

## Overview
This project now includes a comprehensive translation system with support for English and Thai languages. All translations are stored in `public/translation.json` and can be easily extended.

## Features
- **Language Toggle**: Easy language switching via button in header
- **Persistent Preferences**: Language choice saved to localStorage
- **Fallback Support**: Graceful fallback to keys if translations missing
- **React Context**: Global translation state management

## Usage

### Basic Translation
Use the `useTranslation` hook in any component:

```typescript
import { useTranslation } from '../context/TranslationContext';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('common.loading', 'Loading...')}</p>
    </div>
  );
};
```

### Translation Structure
The translation.json file follows a nested structure:

```json
{
  "en": {
    "app": {
      "title": "MyDebugger",
      "description": "Description here"
    },
    "common": {
      "save": "Save",
      "cancel": "Cancel"
    }
  }
}
```

### Adding New Languages
1. Add new language key to translation.json
2. Add translations for all keys
3. Update Language type in TranslationContext.tsx
4. Test the new language toggle

### Adding New Translation Keys
1. Add the key to both language sections in translation.json
2. Use the key in components with the t() function
3. Provide fallback text for missing translations

## Current Languages
- **English (en)**: Default language
- **Thai (th)**: Secondary language

## Components Updated
- ✅ App.tsx: Added TranslationProvider wrapper
- ✅ Header.tsx: Added LanguageToggle component
- ✅ Footer.tsx: Updated to use translations
- ✅ TranslationContext.tsx: Core translation logic
- ✅ LanguageToggle.tsx: Language switching UI

## Testing
1. Click the language toggle button (EN/TH) in the header
2. Verify text changes between English and Thai
3. Check that preferences persist on page reload
4. Verify mobile menu also has language toggle
