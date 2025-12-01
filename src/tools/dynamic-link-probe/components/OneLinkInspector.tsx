/**
 * © 2025 MyDebugger Contributors – MIT License
 * OneLink Deep Link Inspector - Comprehensive AppsFlyer OneLink analysis tool for TrueApp
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  analyzeOneLink,
  OneLinkAnalysis,
  TRUE_APP_CONFIG,
  AppDeepLinkConfig,
  generateCurlCommands,
  CurlCommand,
  generateTestMatrix,
  TestScenario,
  saveTestMatrix,
  loadTestMatrix,
  exportAsMarkdown,
  exportAsJson,
} from '../lib/dynamicLink';
import clsx from 'clsx';
import {
  Search,
  Link2,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Tag,
  Terminal,
  ClipboardList,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  X,
  Play,
  FileJson,
  FileText,
  ExternalLink,
  Settings,
  Save,
} from 'lucide-react';

// Sample OneLink URLs for testing
const SAMPLE_LINKS = [
  {
    label: 'TrueApp Home',
    url: 'https://trueapp.onelink.me/abcd?pid=facebook&c=camp_true_5g&af_dp=trueapp%3A%2F%2Fapp.true.th%2Fhome%3Fentry%3Donelink',
  },
  {
    label: 'Campaign Link',
    url: 'https://trueapp.onelink.me/xyz?pid=google&c=summer_promo&deep_link_value=campaign&deep_link_sub1=promo123',
  },
  {
    label: 'With Web Fallback',
    url: 'https://trueapp.onelink.me/test?pid=line&c=chat_share&af_web_dp=https%3A%2F%2Fapp.true.th%2Fshare',
  },
];

// Load saved config from localStorage
const loadSavedConfig = (): Partial<AppDeepLinkConfig> => {
  try {
    const saved = localStorage.getItem('onelink_inspector_config');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Save config to localStorage
const saveConfig = (config: AppDeepLinkConfig): void => {
  try {
    localStorage.setItem('onelink_inspector_config', JSON.stringify(config));
  } catch {
    // Ignore
  }
};

// Status badge component
const StatusBadge: React.FC<{ status: 'pass' | 'warn' | 'fail' }> = ({ status }) => {
  const config = {
    pass: { icon: CheckCircle2, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'PASS' },
    warn: { icon: AlertCircle, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'WARNING' },
    fail: { icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'FAIL' },
  }[status];
  const Icon = config.icon;
  
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium', config.bg, config.text)}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
};

// Platform icon component
const PlatformIcon: React.FC<{ platform: string; className?: string }> = ({ platform, className }) => {
  switch (platform) {
    case 'ios':
      return <Smartphone className={className} />;
    case 'android':
      return <Smartphone className={className} />;
    case 'desktop':
      return <Monitor className={className} />;
    default:
      return <Monitor className={className} />;
  }
};

export function OneLinkInspector() {
  // State
  const [inputUrl, setInputUrl] = useState('');
  const [analysis, setAnalysis] = useState<OneLinkAnalysis | null>(null);
  const [curlCommands, setCurlCommands] = useState<CurlCommand[]>([]);
  const [testMatrix, setTestMatrix] = useState<TestScenario[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'validation' | 'commands' | 'matrix'>('params');
  const [showSettings, setShowSettings] = useState(false);
  
  // Editable config
  const [config, setConfig] = useState<AppDeepLinkConfig>(() => {
    const saved = loadSavedConfig();
    return { ...TRUE_APP_CONFIG, ...saved };
  });
  
  // Config form state
  const [configForm, setConfigForm] = useState({
    name: config.name,
    expectedScheme: config.expectedScheme,
    expectedHost: config.expectedHost,
  });

  // Analyze URL
  const handleAnalyze = useCallback(() => {
    if (!inputUrl.trim()) return;
    
    const result = analyzeOneLink(inputUrl, config);
    setAnalysis(result);
    
    // Generate curl commands
    setCurlCommands(generateCurlCommands(inputUrl));
    
    // Load or generate test matrix
    const savedMatrix = loadTestMatrix(inputUrl);
    if (savedMatrix) {
      setTestMatrix(savedMatrix);
    } else {
      setTestMatrix(generateTestMatrix(result, config));
    }
  }, [inputUrl, config]);

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  // Copy to clipboard
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Ignore
    }
  };

  // Clear analysis
  const handleClear = () => {
    setInputUrl('');
    setAnalysis(null);
    setCurlCommands([]);
    setTestMatrix([]);
  };

  // Update test scenario
  const updateScenario = (id: string, updates: Partial<TestScenario>) => {
    setTestMatrix(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      if (inputUrl) {
        saveTestMatrix(inputUrl, updated);
      }
      return updated;
    });
  };

  // Export functions
  const handleExportMarkdown = () => {
    if (!analysis) return;
    const md = exportAsMarkdown(analysis, testMatrix, config);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'onelink-report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!analysis) return;
    const json = exportAsJson(analysis, testMatrix);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'onelink-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save config
  const handleSaveConfig = () => {
    const newConfig: AppDeepLinkConfig = {
      ...config,
      name: configForm.name,
      expectedScheme: configForm.expectedScheme.replace('://', ''),
      expectedHost: configForm.expectedHost,
      expectedDeepLinkPrefix: `${configForm.expectedScheme.replace('://', '')}://${configForm.expectedHost}/`,
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    setShowSettings(false);
  };

  // Reset config to defaults
  const handleResetConfig = () => {
    setConfig(TRUE_APP_CONFIG);
    setConfigForm({
      name: TRUE_APP_CONFIG.name,
      expectedScheme: TRUE_APP_CONFIG.expectedScheme,
      expectedHost: TRUE_APP_CONFIG.expectedHost,
    });
    localStorage.removeItem('onelink_inspector_config');
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary-600" />
            OneLink URL Input
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {config.expectedScheme}://{config.expectedHost}
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                showSettings
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              title="Configure deep link scheme"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Deep Link Configuration
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Configure your app's deep link scheme. This is used to validate OneLink URLs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  value={configForm.name}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="TrueApp"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  URL Scheme
                </label>
                <input
                  type="text"
                  value={configForm.expectedScheme}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, expectedScheme: e.target.value.replace('://', '') }))}
                  placeholder="trueapp"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">e.g., trueapp, myapp</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Host
                </label>
                <input
                  type="text"
                  value={configForm.expectedHost}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, expectedHost: e.target.value }))}
                  placeholder="app.true.th"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">e.g., app.true.th</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500">
                Expected: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{configForm.expectedScheme}://{configForm.expectedHost}/</code>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetConfig}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Reset to Default
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://trueapp.onelink.me/xxxx?pid=...&c=...&af_dp=..."
              className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
            />
            {inputUrl && (
              <button
                onClick={() => setInputUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!inputUrl.trim()}
            className={clsx(
              'px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all',
              !inputUrl.trim()
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
            )}
          >
            <Search className="w-4 h-4" />
            Analyze
          </button>
        </div>

        {/* Sample Links */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Try sample links:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_LINKS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setInputUrl(sample.url)}
                className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Results</h3>
                  <StatusBadge status={analysis.validation.overallStatus} />
                </div>
                {analysis.isAppsFlyer && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    AppsFlyer OneLink detected
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportMarkdown}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Export as Markdown"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={handleExportJson}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Export as JSON"
                >
                  <FileJson className="w-5 h-5" />
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Effective Deep Link */}
            {analysis.effectiveDeepLink && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Effective App Deep Link
                    {analysis.derivedDeepLink && (
                      <span className="ml-2 text-xs text-purple-500">(derived from deep_link_value)</span>
                    )}
                  </span>
                  <button
                    onClick={() => handleCopy(analysis.effectiveDeepLink!, 'deeplink')}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    {copied === 'deeplink' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="font-mono text-sm text-purple-900 dark:text-purple-100 break-all">
                  {analysis.effectiveDeepLink}
                </p>
              </div>
            )}

            {/* Base URL */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Base URL</span>
                <button
                  onClick={() => handleCopy(analysis.baseUrl, 'baseurl')}
                  className="text-gray-400 hover:text-primary-600"
                >
                  {copied === 'baseurl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{analysis.baseUrl}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'params', label: 'Parameters', icon: Tag },
                { id: 'validation', label: 'Validation', icon: CheckCircle2 },
                { id: 'commands', label: 'Curl Commands', icon: Terminal },
                { id: 'matrix', label: 'Test Matrix', icon: ClipboardList },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={clsx(
                    'flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Parameters Tab */}
              {activeTab === 'params' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    AppsFlyer Parameters ({Object.values(analysis.afParams).filter(Boolean).length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 text-gray-500 font-medium">Key</th>
                          <th className="text-left py-2 px-3 text-gray-500 font-medium">Value</th>
                          <th className="text-left py-2 px-3 text-gray-500 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analysis.afParams).map(([key, value]) => value && (
                          <tr key={key} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="py-2 px-3 font-mono text-primary-600">{key}</td>
                            <td className="py-2 px-3 font-mono text-gray-700 dark:text-gray-300 break-all max-w-md">{value}</td>
                            <td className="py-2 px-3 text-gray-500 text-xs">
                              {key === 'af_dp' && 'Direct deep link URL'}
                              {key === 'af_web_dp' && 'Web fallback URL'}
                              {key === 'deep_link_value' && 'Page/section identifier'}
                              {key === 'pid' && 'Media source (partner ID)'}
                              {key === 'c' && 'Campaign name'}
                              {key.startsWith('deep_link_sub') && 'Custom sub-parameter'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {Object.keys(analysis.query).length > Object.values(analysis.afParams).filter(Boolean).length && (
                    <>
                      <h4 className="font-medium text-gray-900 dark:text-white mt-6 mb-3">Other Parameters</h4>
                      <div className="space-y-2">
                        {Object.entries(analysis.query)
                          .filter(([key]) => !Object.keys(analysis.afParams).includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                              <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{key}:</span>
                              <span className="font-mono text-sm text-gray-900 dark:text-white break-all">{value}</span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Validation Tab */}
              {activeTab === 'validation' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <StatusBadge status={analysis.validation.overallStatus} />
                    <span className="text-sm text-gray-500">
                      Validating against {config.name} rules
                    </span>
                  </div>

                  <div className="space-y-2">
                    {analysis.validation.checks.map((check, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          'flex items-start gap-3 p-3 rounded-lg',
                          check.passed
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-red-50 dark:bg-red-900/20'
                        )}
                      >
                        {check.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <div>
                          <p className={clsx(
                            'font-medium',
                            check.passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                          )}>
                            {check.name}
                          </p>
                          <p className={clsx(
                            'text-sm',
                            check.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                          )}>
                            {check.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expected Configuration */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Expected Configuration</h5>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-gray-500">Scheme:</dt>
                      <dd className="font-mono text-gray-900 dark:text-white">{config.expectedScheme}://</dd>
                      <dt className="text-gray-500">Host:</dt>
                      <dd className="font-mono text-gray-900 dark:text-white">{config.expectedHost}</dd>
                      <dt className="text-gray-500">Prefix:</dt>
                      <dd className="font-mono text-gray-900 dark:text-white">{config.expectedDeepLinkPrefix}</dd>
                    </dl>
                  </div>
                </div>
              )}

              {/* Curl Commands Tab */}
              {activeTab === 'commands' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                          Browser Limitation
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Due to CORS restrictions, redirect chains cannot be followed in the browser.
                          Run these curl commands in your terminal to see the full redirect chain.
                        </p>
                      </div>
                    </div>
                  </div>

                  {curlCommands.map((cmd) => (
                    <div key={cmd.platform} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={cmd.platform} className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">{cmd.label}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(cmd.command, `curl-${cmd.platform}`)}
                          className={clsx(
                            'px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors',
                            copied === `curl-${cmd.platform}`
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                          )}
                        >
                          {copied === `curl-${cmd.platform}` ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 bg-gray-900 text-green-400 text-sm font-mono overflow-x-auto">
                        {cmd.command}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Test Matrix Tab */}
              {activeTab === 'matrix' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Track your manual QA tests. Results are saved locally per OneLink URL.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Platform</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">App State</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Expected Behavior</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium w-32">Status</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testMatrix.map((scenario) => (
                          <tr key={scenario.id} className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <PlatformIcon platform={scenario.platform} className="w-4 h-4 text-gray-400" />
                                <span className="capitalize text-gray-700 dark:text-gray-300">{scenario.platform}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400 capitalize">
                              {scenario.appState === 'na' ? 'N/A' : scenario.appState.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-3 text-gray-700 dark:text-gray-300 text-xs max-w-xs">
                              {scenario.expectedBehavior}
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={scenario.status || 'pending'}
                                onChange={(e) => updateScenario(scenario.id, { status: e.target.value as TestScenario['status'] })}
                                className={clsx(
                                  'text-xs px-2 py-1 rounded border-0 font-medium',
                                  scenario.status === 'pass' && 'bg-green-100 text-green-700',
                                  scenario.status === 'fail' && 'bg-red-100 text-red-700',
                                  scenario.status === 'skip' && 'bg-gray-100 text-gray-600',
                                  (!scenario.status || scenario.status === 'pending') && 'bg-yellow-100 text-yellow-700'
                                )}
                              >
                                <option value="pending">Pending</option>
                                <option value="pass">Pass</option>
                                <option value="fail">Fail</option>
                                <option value="skip">Skip</option>
                              </select>
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="text"
                                value={scenario.notes || ''}
                                onChange={(e) => updateScenario(scenario.id, { notes: e.target.value })}
                                placeholder="Add notes..."
                                className="w-full text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Link2 className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            OneLink Deep Link Inspector
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-4">
            Paste an AppsFlyer OneLink URL to analyze it. This tool will parse parameters,
            validate against {config.name} rules, and help you test across platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Parse AF params
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Validate deep links
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Generate curl commands
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Track QA tests
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OneLinkInspector;
