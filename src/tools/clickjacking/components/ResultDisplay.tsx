import React from 'react';
import { ValidationResult } from '../types';

interface ResultDisplayProps {
  result: ValidationResult | null;
  error: string | null;
}

/**
 * Component to display validation results
 */
const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, error }) => {
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { url, canBeFramed, headers, frameLoaded, statusCode, message } = result;
  const isProtected = !canBeFramed || !frameLoaded;

  return (
    <div className={`p-4 ${isProtected ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border rounded-md mb-6`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isProtected ? (
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-medium ${isProtected ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
            {isProtected ? 'Protection Detected' : 'Vulnerable to Clickjacking'}
          </h3>
          <p className={`text-sm ${isProtected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'} mt-1`}>
            {isProtected
              ? 'This website appears to have protection against clickjacking attacks.'
              : 'This website may be vulnerable to clickjacking attacks.'}
          </p>
          {message && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>
          )}
          {statusCode && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Status: {statusCode} {result.statusText || ''}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Security Headers</h4>
        <div className="space-y-2">
          <HeaderInfo 
            name="X-Frame-Options" 
            value={headers['x-frame-options']} 
          />
          <HeaderInfo 
            name="Content-Security-Policy" 
            value={headers['content-security-policy']} 
            highlight={headers['frame-ancestors']} 
          />
        </div>
      </div>
    </div>
  );
};

interface HeaderInfoProps {
  name: string;
  value?: string;
  highlight?: string;
}

const HeaderInfo: React.FC<HeaderInfoProps> = ({ name, value, highlight }) => {
  if (!value) {
    return (
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}:</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">Not present</p>
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}:</p>
      <div className="text-sm text-gray-600 dark:text-gray-400 break-words">
        {highlight ? (
          <>
            <span>{value.replace(highlight, '')}</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">{highlight}</span>
          </>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
