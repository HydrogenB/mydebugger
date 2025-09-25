/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useMemo } from "react";
import { Button } from "../../../design-system/components/inputs";
import { TOOL_PANEL_CLASS } from "../../../design-system/foundations/layout";
import DEFAULT_OPTIONS from "../config/defaultOptions";
import type {
  ConverterOptions,
  FlattenStrategy,
  InputFormat,
  SchemaMode,
  KeyOrder,
  NullPolicy,
} from "../types";

interface OptionsFormProps {
  options: ConverterOptions;
  updateOptions: (updater: (prev: ConverterOptions) => ConverterOptions) => void;
}

const inputFormats: { value: InputFormat; label: string }[] = [
  { value: "auto", label: "Auto detect" },
  { value: "bson", label: "BSON (Mongo dump)" },
  { value: "ndjson", label: "NDJSON (newline delimited)" },
  { value: "json-array", label: "JSON Array" },
];

const flattenStrategies: {
  value: FlattenStrategy;
  label: string;
  description: string;
}[] = [
  {
    value: "index",
    label: "Index arrays",
    description:
      "Produces columns like items[0].name. Truncates arrays beyond the configured max length and logs the truncation.",
  },
  {
    value: "join",
    label: "Join values",
    description:
      "Concatenates primitive array values into a single field using the join delimiter. Nested arrays fall back to indexing.",
  },
  {
    value: "explode",
    label: "Explode rows",
    description:
      "Emits one row per array element. Useful for analytics but can greatly increase row counts. Controlled by explode max rows.",
  },
];

const schemaModes: { value: SchemaMode; label: string; caption?: string }[] = [
  {
    value: "two-pass",
    label: "Two-pass (deterministic)",
    caption: "Reads the file twice to guarantee complete schema coverage.",
  },
  { value: "single-pass", label: "Single-pass (sample)" },
];

const keyOrders: { value: KeyOrder; label: string }[] = [
  { value: "alpha", label: "A→Z" },
  { value: "first-seen", label: "First-seen" },
  { value: "custom", label: "Custom" },
];

const nullPolicies: { value: NullPolicy; label: string }[] = [
  { value: "empty", label: "Empty cell" },
  { value: "literal-null", label: "Literal null" },
];

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <div className={`${TOOL_PANEL_CLASS} space-y-4`}>
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{description}</p>
      ) : null}
    </div>
    {children}
  </div>
);

const FieldRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid gap-4 sm:grid-cols-2">{children}</div>
);

const HelpText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{children}</p>
);

const OptionsForm: React.FC<OptionsFormProps> = ({ options, updateOptions }) => {
  const setOption = (mutator: (draft: ConverterOptions) => void) => {
    updateOptions((prev) => {
      const next = structuredClone(prev);
      mutator(next);
      return next;
    });
  };

  const resetOptions = () => updateOptions(() => structuredClone(DEFAULT_OPTIONS));

  const handleNumberChange = (
    mutator: (draft: ConverterOptions, value: number) => void,
  ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = Number.parseInt(event.target.value, 10);
      const value = Number.isNaN(parsed) ? 0 : parsed;
      setOption((draft) => mutator(draft, value));
    };

  const handleOptionalNumberChange = (
    mutator: (draft: ConverterOptions, value: number | null) => void,
  ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value.trim();
      if (!raw) {
        setOption((draft) => mutator(draft, null));
        return;
      }
      const parsed = Number.parseInt(raw, 10);
      if (Number.isNaN(parsed)) return;
      setOption((draft) => mutator(draft, Math.max(1, parsed)));
    };

  const handleStringChange = (
    mutator: (draft: ConverterOptions, value: string) => void,
  ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setOption((draft) => mutator(draft, event.target.value));
    };

  const handleBooleanChange = (
    mutator: (draft: ConverterOptions, value: boolean) => void,
  ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setOption((draft) => mutator(draft, event.target.checked));
    };

  const normalizedDelimiter = useMemo(() => options.csv.delimiter.slice(0, 1), [options.csv.delimiter]);
  const normalizedQuote = useMemo(() => options.csv.quote.slice(0, 1), [options.csv.quote]);

  return (
    <div className="space-y-6">
      {/* Input format */}
      <Section
        title="Input Format"
        description="Auto-detect by default, or force a format if you know the file type."
      >
        <div className="grid gap-2">
          {inputFormats.map((fmt) => (
            <label key={fmt.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="input-format"
                className="accent-primary-600"
                checked={options.format === fmt.value}
                onChange={() => setOption((d) => (d.format = fmt.value))}
              />
              <span className="text-gray-800 dark:text-gray-200">{fmt.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Flattening */}
      <Section
        title="Flattening"
        description="Choose how arrays and nested objects become CSV columns."
      >
        <div className="space-y-3">
          <div className="grid gap-2">
            {flattenStrategies.map((s) => (
              <label key={s.value} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="flatten-strategy"
                  className="accent-primary-600 mt-0.5"
                  checked={options.flatten.strategy === s.value}
                  onChange={() => setOption((d) => (d.flatten.strategy = s.value))}
                />
                <span>
                  <span className="block text-gray-900 dark:text-gray-100 font-medium">{s.label}</span>
                  <span className="block text-gray-600 dark:text-gray-300 text-xs">{s.description}</span>
                </span>
              </label>
            ))}
          </div>

          <FieldRow>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Join delimiter
              </label>
              <input
                type="text"
                value={options.flatten.joinDelimiter}
                onChange={handleStringChange((d, v) => (d.flatten.joinDelimiter = v))}
                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
                placeholder="|"
              />
              <HelpText>Used when strategy is Join.</HelpText>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Max array length to index
              </label>
              <input
                type="number"
                min={0}
                value={options.flatten.maxArrayLength}
                onChange={handleNumberChange((d, v) => (d.flatten.maxArrayLength = Math.max(0, v)))}
                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
              />
              <HelpText>0 = unlimited (use carefully).</HelpText>
            </div>
          </FieldRow>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Explode max rows
            </label>
            <input
              type="number"
              min={1}
              value={options.flatten.explodeMaxRows}
              onChange={handleNumberChange((d, v) => (d.flatten.explodeMaxRows = Math.max(1, v)))}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
            />
            <HelpText>Safety cap when using Explode rows.</HelpText>
          </div>
        </div>
      </Section>

      {/* Schema Discovery */}
      <Section
        title="Schema Discovery"
        description="Two-pass ensures deterministic headers. Single-pass samples then locks."
      >
        <div className="space-y-3">
          <div className="grid gap-2">
            {schemaModes.map((m) => (
              <label key={m.value} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="schema-mode"
                  className="accent-primary-600 mt-0.5"
                  checked={options.schemaMode === m.value}
                  onChange={() => setOption((d) => (d.schemaMode = m.value))}
                />
                <span>
                  <span className="block text-gray-900 dark:text-gray-100 font-medium">{m.label}</span>
                  {m.caption ? (
                    <span className="block text-gray-600 dark:text-gray-300 text-xs">{m.caption}</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>

          <FieldRow>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Sample rows (single-pass)
              </label>
              <input
                type="number"
                min={100}
                value={options.performance.discoverySampleRows}
                onChange={handleNumberChange((d, v) => (d.performance.discoverySampleRows = Math.max(100, v)))}
                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
              />
              <HelpText>Used only in Single-pass mode.</HelpText>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Key order
              </label>
              <select
                value={options.schemaKeyOrder}
                onChange={(e) => setOption((d) => (d.schemaKeyOrder = e.target.value as KeyOrder))}
                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
              >
                {keyOrders.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
              <HelpText>Deterministic header ordering.</HelpText>
            </div>
          </FieldRow>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Null/undefined policy
            </label>
            <div className="mt-1 flex gap-4">
              {nullPolicies.map((p) => (
                <label key={p.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="null-policy"
                    className="accent-primary-600"
                    checked={options.nullPolicy === p.value}
                    onChange={() => setOption((d) => (d.nullPolicy = p.value))}
                  />
                  <span className="text-gray-800 dark:text-gray-200">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CSV Dialect */}
      <Section
        title="CSV Dialect"
        description="RFC4180-compliant encoding with configurable delimiter, quote, newline, header, and BOM."
      >
        <FieldRow>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Delimiter
            </label>
            <input
              type="text"
              value={normalizedDelimiter}
              onChange={(e) => setOption((d) => (d.csv.delimiter = e.target.value.slice(0, 1)))}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
              placeholder="," maxLength={1}
            />
            <HelpText>Single character (e.g., , or ;).</HelpText>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Quote
            </label>
            <input
              type="text"
              value={normalizedQuote}
              onChange={(e) => setOption((d) => (d.csv.quote = e.target.value.slice(0, 1)))}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
              placeholder='"' maxLength={1}
            />
            <HelpText>Single character (typically ")</HelpText>
          </div>
        </FieldRow>

        <FieldRow>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Newline
            </label>
            <div className="mt-1 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="newline"
                  className="accent-primary-600"
                  checked={options.csv.newline === "\n"}
                  onChange={() => setOption((d) => (d.csv.newline = "\n"))}
                />
                <span>LF (\n)</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="newline"
                  className="accent-primary-600"
                  checked={options.csv.newline === "\r\n"}
                  onChange={() => setOption((d) => (d.csv.newline = "\r\n"))}
                />
                <span>CRLF (Windows)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Header row
            </label>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <input
                id="include-header"
                type="checkbox"
                className="accent-primary-600"
                checked={options.csv.includeHeader}
                onChange={handleBooleanChange((d, v) => (d.csv.includeHeader = v))}
              />
              <label htmlFor="include-header">Include header</label>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <input
                id="include-bom"
                type="checkbox"
                className="accent-primary-600"
                checked={options.csv.includeBom}
                onChange={handleBooleanChange((d, v) => (d.csv.includeBom = v))}
              />
              <label htmlFor="include-bom">Include UTF-8 BOM (for Excel)</label>
            </div>
          </div>
        </FieldRow>
      </Section>

      {/* Numerics */}
      <Section
        title="Numerics"
        description="Emit numbers as strings to preserve precision (recommended)."
      >
        <div className="grid gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary-600"
              checked={options.numerics.stringifyIntegers}
              onChange={handleBooleanChange((d, v) => (d.numerics.stringifyIntegers = v))}
            />
            <span className="text-gray-800 dark:text-gray-200">Stringify integers</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary-600"
              checked={options.numerics.stringifyFloats}
              onChange={handleBooleanChange((d, v) => (d.numerics.stringifyFloats = v))}
            />
            <span className="text-gray-800 dark:text-gray-200">Stringify floats (incl. NaN/±Inf)</span>
          </label>
        </div>
      </Section>

      {/* Output */}
      <Section
        title="Output"
        description="Control CSV splitting and ZIP packaging to manage memory and file size."
      >
        <FieldRow>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Split every N rows (blank = single file)
            </label>
            <input
              type="number"
              min={1}
              value={options.output.splitEvery ?? ""}
              onChange={handleOptionalNumberChange((d, v) => (d.output.splitEvery = v))}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
            />
            <HelpText>Recommended for large datasets (e.g., 100,000).</HelpText>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              ZIP output
            </label>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <input
                id="zip-output"
                type="checkbox"
                className="accent-primary-600"
                checked={options.output.zipOutput}
                onChange={handleBooleanChange((d, v) => (d.output.zipOutput = v))}
              />
              <label htmlFor="zip-output">Produce ZIP (recommended when splitting)</label>
            </div>
          </div>
        </FieldRow>
      </Section>

      {/* Performance */}
      <Section
        title="Performance"
        description="Tune read buffers and line limits. Defaults are safe for most machines."
      >
        <FieldRow>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Read chunk bytes
            </label>
            <input
              type="number"
              min={1024}
              step={1024}
              value={options.performance.readChunkBytes}
              onChange={handleNumberChange((d, v) => (d.performance.readChunkBytes = Math.max(1024, v)))}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
            />
            <HelpText>Typical 4–16 MB. Higher can improve throughput.</HelpText>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Line buffer limit (NDJSON)
            </label>
            <input
              type="number"
              min={64 * 1024}
              step={1024}
              value={options.performance.lineBufferLimit}
              onChange={handleNumberChange((d, v) => (d.performance.lineBufferLimit = Math.max(64 * 1024, v)))}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm"
            />
            <HelpText>Max characters in a single NDJSON line.</HelpText>
          </div>
        </FieldRow>
      </Section>

      {/* General */}
      <Section
        title="General"
        description="Error handling and flow control."
      >
        <div className="grid gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary-600"
              checked={options.general.stopOnError}
              onChange={handleBooleanChange((d, v) => (d.general.stopOnError = v))}
            />
            <span className="text-gray-800 dark:text-gray-200">Stop on first error</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary-600"
              checked={options.general.persistSchema}
              onChange={handleBooleanChange((d, v) => (d.general.persistSchema = v))}
            />
            <span className="text-gray-800 dark:text-gray-200">Persist schema alongside output</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary-600"
              checked={options.general.autoStartAfterDiscovery}
              onChange={handleBooleanChange((d, v) => (d.general.autoStartAfterDiscovery = v))}
            />
            <span className="text-gray-800 dark:text-gray-200">Auto-start conversion after discovery</span>
          </label>
        </div>
      </Section>

      <div className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={resetOptions}>
          Reset to defaults
        </Button>
      </div>
    </div>
  );
};

export default OptionsForm;
