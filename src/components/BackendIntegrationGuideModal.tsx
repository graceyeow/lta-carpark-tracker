import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Server, Key, Activity } from 'lucide-react';

interface BackendIntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendIntegrationGuideModal: React.FC<BackendIntegrationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [testEndpoint, setTestEndpoint] = useState('/api/health');
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string; data?: any }>({
    status: 'idle',
    message: '',
  });

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTestConnection = async () => {
    setTestResult({ status: 'loading', message: `Calling ${testEndpoint} ...` });
    try {
      const res = await fetch(testEndpoint, { method: 'GET' });
      const json = await res.json();
      if (res.ok) {
        setTestResult({
          status: 'success',
          message: `HTTP ${res.status}: Success!`,
          data: json,
        });
      } else {
        setTestResult({
          status: 'error',
          message: `HTTP ${res.status}: ${json.message || res.statusText}`,
          data: json,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Network error connecting to ${testEndpoint}: ${err.message}`,
      });
    }
  };

  const sampleEnv = `# Add to your .env or serverless environment variables:
LTA_DATAMALL_ACCOUNT_KEY="YOUR_KEY_HERE"`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Serverless LTA DataMall Endpoints
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Created in /api directory (root level)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300">
          {/* Serverless Endpoints Created */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Available Serverless Endpoints (/api)</span>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    GET /api/carparkavailability
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">/api/carparkavailability.ts</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Pulls live carpark lots (HDB + LTA + URA) from LTA DataMall:
                  <br />
                  <code className="text-slate-700 dark:text-slate-300 font-mono">
                    https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
                  </code>
                  <br />
                  Injects the required header <code className="font-mono text-emerald-600">AccountKey: &lt;key&gt;</code> without exposing secrets in client code.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    GET /api/health
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">/api/health.ts</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Healthcheck endpoint confirming service status and whether your LTA AccountKey is loaded in the environment.
                </p>
              </div>
            </div>
          </div>

          {/* How to add the LTA AccountKey */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Configuring Your LTA AccountKey</span>
              </div>
              <button
                onClick={() => handleCopy(sampleEnv, 'env')}
                className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium"
              >
                {copiedSection === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'env' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p>
              When you are ready to input your key, define it in your environment variables. No keys are hardcoded:
            </p>
            <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
              {sampleEnv}
            </pre>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>Need a key? Request one at:</span>
              <a
                href="https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:underline inline-flex items-center gap-0.5"
              >
                LTA DataMall Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Interactive Endpoint Tester */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              Live Endpoint Tester
            </span>
            <div className="flex items-center gap-2">
              <select
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="/api/health">GET /api/health</option>
                <option value="/api/carparkavailability">GET /api/carparkavailability</option>
              </select>
              <button
                onClick={handleTestConnection}
                disabled={testResult.status === 'loading'}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-md font-semibold cursor-pointer disabled:opacity-50"
              >
                {testResult.status === 'loading' ? 'Testing...' : 'Test Request'}
              </button>
            </div>
            {testResult.status !== 'idle' && (
              <div
                className={`p-2.5 rounded text-xs space-y-1 ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : testResult.status === 'error'
                    ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                <div className="font-semibold">{testResult.message}</div>
                {testResult.data && (
                  <pre className="font-mono text-[10px] overflow-x-auto max-h-40 p-2 bg-black/10 dark:bg-black/30 rounded">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
