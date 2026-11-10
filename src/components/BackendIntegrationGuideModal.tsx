import React, { useState } from 'react';
import { X, Code2, Check, Copy, ExternalLink, ArrowRight, Server, Database, Globe } from 'lucide-react';
import { API_CONFIG } from '../services/apiConfig';

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
  const [testUrl, setTestUrl] = useState(API_CONFIG.BASE_URL);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTestConnection = async () => {
    setTestResult({ status: 'loading', message: `Pinging ${testUrl}/carparks ...` });
    try {
      const res = await fetch(`${testUrl}/carparks`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        setTestResult({
          status: 'success',
          message: `Connection successful! Received ${Array.isArray(json) ? json.length : 1} records from backend.`,
        });
      } else {
        setTestResult({
          status: 'error',
          message: `Backend returned HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Network error connecting to backend: ${err.message || 'Make sure server is running and CORS is enabled.'}`,
      });
    }
  };

  const sampleExpressCode = `// server/index.js (Express sample backend for ParkSG)
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// 1. Get all Singapore Carparks
app.get('/api/carparks', async (req, res) => {
  // Query your PostgreSQL / MongoDB / Firestore or cache
  res.json(carparksData);
});

// 2. Proxy real-time lot availability from Singapore Data.gov.sg
app.get('/api/carparks/availability', async (req, res) => {
  try {
    const govRes = await fetch('https://api.data.gov.sg/v1/transport/carpark-availability');
    const govData = await govRes.json();
    res.json(govData);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch Data.gov.sg' });
  }
});

app.listen(8080, () => console.log('ParkSG backend listening on port 8080'));`;

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
                Backend Connection Architecture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specifications for integrating your future backend API
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
          {/* Step 1: Configuration file */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Centralized Connection Config</span>
            </div>
            <p>
              The frontend is fully decoupled. All API routes and switches are managed in{' '}
              <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                src/services/apiConfig.ts
              </code>.
            </p>
            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1">
              <div>VITE_API_BASE_URL="https://your-api-domain.com/api"</div>
              <div className="text-slate-500">// Or set USE_BACKEND_API: true in apiConfig.ts</div>
            </div>
          </div>

          {/* Step 2: REST Endpoints Contract */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Expected REST Endpoints Contract</span>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
              <div className="p-2.5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">GET /api/carparks</span>
                <span className="text-slate-500">Returns list of carparks, metadata & rates</span>
              </div>
              <div className="p-2.5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">GET /api/carparks/availability</span>
                <span className="text-slate-500">Live available lots mapped by carpark ID</span>
              </div>
              <div className="p-2.5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">GET /api/carparks/:id</span>
                <span className="text-slate-500">Single carpark detail & 12h history</span>
              </div>
            </div>
          </div>

          {/* Step 3: Singapore Data.gov.sg API */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Official Singapore Government Open Data</span>
            </div>
            <p>
              Singapore's LTA / HDB carparks publish real-time lot availability every 60 seconds on Data.gov.sg:
            </p>
            <div className="flex items-center justify-between p-2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200">
              <span className="truncate">{API_CONFIG.DATA_GOV_SG_URL}</span>
              <a
                href={API_CONFIG.DATA_GOV_SG_URL}
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-emerald-600 hover:underline shrink-0 flex items-center gap-1"
              >
                Inspect Feed <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Step 4: Sample Backend Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Sample Express / Node Proxy</span>
              </div>
              <button
                onClick={() => handleCopy(sampleExpressCode, 'express')}
                className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium"
              >
                {copiedSection === 'express' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'express' ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
              {sampleExpressCode}
            </pre>
          </div>

          {/* Interactive Backend Ping Tester */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              Live Backend Connection Tester
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="http://localhost:8080/api"
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={handleTestConnection}
                disabled={testResult.status === 'loading'}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-md font-semibold cursor-pointer disabled:opacity-50"
              >
                {testResult.status === 'loading' ? 'Testing...' : 'Test Ping'}
              </button>
            </div>
            {testResult.status !== 'idle' && (
              <div
                className={`p-2 rounded text-xs ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : testResult.status === 'error'
                    ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                {testResult.message}
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
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
