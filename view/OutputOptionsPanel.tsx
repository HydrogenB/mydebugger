/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import type { OutputOptions } from '../model/jsonConverterTypes';

interface Props {
  options: OutputOptions;
  onChange: (opts: OutputOptions) => void;
}

function OutputOptionsPanel({ options, onChange }: Props) {
  const update = (partial: Partial<OutputOptions>) =>
    onChange({ ...options, ...partial });

  const delimiterOptions = [
    { value: ',', label: 'Comma' },
    { value: ';', label: 'Semicolon' },
    { value: '|', label: 'Pipe' },
    { value: '\t', label: 'Tab' },
  ];

  return (
    <fieldset className="space-y-2 text-sm border p-2 rounded-md">
      <legend className="font-semibold">Output Options</legend>
      <label className="mr-2 block" htmlFor="delimiter">
        Delimiter
        <select
          id="delimiter"
          className="ml-2 border px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-200"
          value={options.delimiter}
          onChange={(e) => update({ delimiter: e.target.value })}
        >
          {delimiterOptions.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center gap-1" htmlFor="includeHeader">
        <input
          id="includeHeader"
          type="checkbox"
          checked={options.includeHeader}
          onChange={(e) => update({ includeHeader: e.target.checked })}
        />
        Include Header
      </label>
      <label className="inline-flex items-center gap-1" htmlFor="suppressNewlines">
        <input
          id="suppressNewlines"
          type="checkbox"
          checked={options.suppressNewlines}
          onChange={(e) => update({ suppressNewlines: e.target.checked })}
        />
        Suppress Newlines
      </label>
      <label className="inline-flex items-center gap-1" htmlFor="flattenOpt">
        <input
          id="flattenOpt"
          type="checkbox"
          checked={options.flatten}
          onChange={(e) => update({ flatten: e.target.checked })}
        />
        Flatten
      </label>
      <label className="inline-flex items-center gap-1" htmlFor="forceQuotes">
        <input
          id="forceQuotes"
          type="checkbox"
          checked={options.forceQuotes}
          onChange={(e) => update({ forceQuotes: e.target.checked })}
        />
        Force Quotes
      </label>
      <label className="inline-flex items-center gap-1" htmlFor="upgradeToArray">
        <input
          id="upgradeToArray"
          type="checkbox"
          checked={options.upgradeToArray}
          onChange={(e) => update({ upgradeToArray: e.target.checked })}
        />
        Upgrade To Array
      </label>
      <label className="inline-flex items-center gap-1" htmlFor="useAltMode">
        <input
          id="useAltMode"
          type="checkbox"
          checked={options.useAltMode}
          onChange={(e) => update({ useAltMode: e.target.checked })}
        />
        Alternative Mode
      </label>
      <label className="block" htmlFor="objectPath">
        <span className="mr-2">Object Path</span>
        <input
          id="objectPath"
          type="text"
          value={options.objectPath}
          onChange={(e) => update({ objectPath: e.target.value })}
          className="border px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-200"
        />
      </label>
      <label className="block" htmlFor="dateFormat">
        <span className="mr-2">Date Format</span>
        <input
          id="dateFormat"
          type="text"
          value={options.dateFormat}
          onChange={(e) => update({ dateFormat: e.target.value })}
          className="border px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-200"
          placeholder="YYYY-MM-DD"
        />
      </label>
      <label className="block" htmlFor="lineEndings">
        <span className="mr-2">Line Endings</span>
        <select
          id="lineEndings"
          value={options.eol}
          onChange={(e) => update({ eol: e.target.value as 'LF' | 'CRLF' })}
          className="border px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-200"
        >
          <option value="LF">LF</option>
          <option value="CRLF">CRLF</option>
        </select>
      </label>
    </fieldset>
  );
};

export default OutputOptionsPanel;
