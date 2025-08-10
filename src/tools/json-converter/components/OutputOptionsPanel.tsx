import React from 'react';
import type { OutputOptions } from '../types';

interface Props {
  options: OutputOptions;
  onChange: (opts: OutputOptions) => void;
}

const OutputOptionsPanel: React.FC<Props> = ({ options, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Output Options</div>
      <div className="flex items-center gap-3 text-sm">
        <label className="inline-flex items-center gap-1">
          <input
            type="checkbox"
            checked={options.pretty}
            onChange={(e) => onChange({ ...options, pretty: e.target.checked })}
          />
          Pretty print
        </label>
        <label className="inline-flex items-center gap-1">
          <input
            type="checkbox"
            checked={options.includeHeader}
            onChange={(e) => onChange({ ...options, includeHeader: e.target.checked })}
          />
          Include header
        </label>
      </div>
    </div>
  );
};

export default OutputOptionsPanel;



