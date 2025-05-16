# Base64 Image Debugger

This tool helps you visualize and debug base64-encoded images in your web application.

## Features

- **Paste and preview**: Paste base64 encoded image data and see it rendered instantly
- **Format detection**: Automatically detects image format (PNG, JPEG, GIF, etc.)
- **Image details**: Shows important information about the image:
  - Dimensions (width × height)
  - File size (in bytes and human-readable format)
  - Image format
  - Data URL length
- **Error handling**: Displays helpful error messages for invalid data
- **Supports various formats**: Works with PNG, JPEG, GIF, SVG, and other image formats supported by browsers
- **Input flexibility**: Works with both full data URLs (`data:image/png;base64,...`) and raw base64 strings
- **Dark mode support**: Compatible with dark mode preferences

## How to Use

1. Navigate to the Base64 Image Debugger tool
2. Paste your base64 string in the input field (with or without the `data:image/...` prefix)
3. The image preview will appear instantly if the data is valid
4. View the details section for extensive information about the image

## Examples

You can use it to debug base64 images from various sources:
- Canvas toDataURL() output
- File API base64 conversions
- API responses containing base64-encoded images
- Testing image optimizations

## Implementation Details

The tool uses React and browser APIs to:
- Parse and validate base64 image data
- Create image previews using the Image API
- Calculate file size based on base64 length
- Extract image dimensions and format information
