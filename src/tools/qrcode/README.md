# QR Code Generator Component

## Overview

The QR Code Generator is a React component that allows users to create, customize, save, and share QR codes for URLs or text.

## Component Structure

### Main Component
- `QRCodeGenerator.tsx`: The main component that renders the UI and handles user interactions.

### Supporting Files
- `hooks/useQRCodeGenerator.ts`: Custom hook containing all QR code functionality and state management.
- `types.ts`: Type definitions for component props, settings, and saved QR codes.
- `utils/index.ts`: Utility functions for QR code generation, saving, loading, etc.
- `components/`: UI components used by the main component.

## State Management

The component uses the `useQRCodeGenerator` custom hook to manage all state:

### State Variables
- `input`: The text/URL input for QR code generation
- `encodedLink`: URL-encoded version of the input
- `settings`: Visual settings for the QR code (size, colors, error correction)
- `qrCodeUrl`: Generated QR code data URL
- `toastMessage`: Notification message for user feedback
- `showCosmeticOptions`: Whether to show customization options
- `savedQRCodes`: Array of saved QR codes
- `showSaveModal`: Whether the save modal is visible
- `nickname`: Nickname for the current QR code when saving
- `showLargeQRModal`: Whether the large QR preview modal is visible
- `isRunningLink`: Whether a link is being opened
- `isMobile`: Whether running on a mobile device

### Action Functions
- `setInput`: Update the input text
- `updateSettings`: Update QR code visual settings
- `toggleCosmeticOptions`: Show/hide customization options
- `generateQRCode`: Generate a new QR code
- `saveQRCode`: Save the current QR code
- `deleteQRCode`: Delete a saved QR code
- `setShowSaveModal`: Show/hide save modal
- `setNickname`: Update nickname for current QR code
- `setShowLargeQRModal`: Show/hide large QR preview
- `setIsRunningLink`: Track link opening state
- `showToast`: Display a notification message

## Helper Functions

The component includes several helper functions:
- `handleCopyToClipboard`: Copy text to clipboard
- `handleCopyEncodedLink`: Copy encoded link to clipboard
- `handleCopyRawLink`: Copy raw link to clipboard
- `handleCopyQRAsImage`: Copy QR code as image to clipboard
- `handleDownloadQR`: Download QR code as PNG
- `handleRunLink`: Open the link in the browser
- `handleSharePageWithLink`: Generate and copy shareable link

## Usage

The component accepts an optional `initialLink` prop that can be used to pre-populate the input field.

```tsx
import { QRCodeGenerator } from './tools/qrcode';

const App = () => {
  return <QRCodeGenerator initialLink="https://example.com" />;
};
```

## Features

- Generate QR codes for URLs or text
- Customize QR code appearance (size, colors, error correction)
- Save QR codes for later use
- Download QR codes as PNG images
- Copy QR codes as images (where supported by browser)
- Share QR codes via links
- Light and dark mode compatible

## Implementation Notes

- Uses `qrcode` library for QR code generation
- Uses React state and callbacks for efficient rendering
- Adapts UI for mobile devices
- Saves QR codes in browser local storage
