/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { ImageInfo } from '../model/base64Image';

interface Props {
  base64Input: string;
  imageUrl: string;
  error: string;
  imageInfo: ImageInfo | null;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handlePasteExample: () => void;
  clear: () => void;
}

export function Base64ImageDebuggerView({
  base64Input,
  imageUrl,
  error,
  imageInfo,
  handleInputChange,
  handlePasteExample,
  clear,
}: Props) {
  return (
  <div className={TOOL_PANEL_CLASS}>
    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Base64 Image Debugger</h2>

    <div className="mb-4">
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="base64-input" className="block text-gray-700 dark:text-gray-300 mb-2">
        Paste your base64 image data:
      </label>
      <textarea
        id="base64-input"
        className="w-full h-32 px-3 py-2 text-gray-700 border rounded-xl focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        value={base64Input}
        onChange={handleInputChange}
        placeholder="data:image/png;base64,..."
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          onClick={handlePasteExample}
        >
          Paste Example
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          onClick={clear}
        >
          Clear
        </button>
      </div>
    </div>

    {error && (
      <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded dark:bg-red-900 dark:text-red-200 dark:border-red-700">
        {error}
      </div>
    )}

    {imageUrl && !error && (
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Preview:</h3>
        <div className="border p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
          <img
            src={imageUrl}
            alt="Base64 Preview"
            className="max-w-full mx-auto"
            style={{ maxHeight: '400px' }}
          />
        </div>
      </div>
    )}

    {imageInfo && (
      <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Image Details:</h3>
        <table className="w-full text-left">
          <tbody>
            <tr className="border-b dark:border-gray-700">
              <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Format:</td>
              <td className="py-2 text-gray-800 dark:text-gray-200">{imageInfo.type}</td>
            </tr>
            <tr className="border-b dark:border-gray-700">
              <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Dimensions:</td>
              <td className="py-2 text-gray-800 dark:text-gray-200">{imageInfo.width} × {imageInfo.height} pixels</td>
            </tr>
            <tr className="border-b dark:border-gray-700">
              <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">File Size:</td>
              <td className="py-2 text-gray-800 dark:text-gray-200">{imageInfo.sizeFormatted} ({imageInfo.size} bytes)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Data URL Length:</td>
              <td className="py-2 text-gray-800 dark:text-gray-200">{imageUrl.length} characters</td>
            </tr>
          </tbody>
        </table>
      </div>
    )}
  </div>
  );
}

export default Base64ImageDebuggerView;
