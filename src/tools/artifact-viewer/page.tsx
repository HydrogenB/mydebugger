
import React, { useMemo } from 'react';
import ClientArtifactViewer from './components/ClientArtifactViewer';
import { analyzeCode } from './utils/seoAnalyzer';

// Default code (simulated DB fetch)
const DEFAULT_CODE = `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Hello Artifact!
        </h1>
        <p className="text-gray-600 mb-6">
          This is a live React component rendered directly from text.
        </p>
        
        <div className="text-6xl font-mono font-bold text-gray-800 mb-8">
          {count}
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => {
              setCount(c => c - 1);
              console.log('Decreased count to', count - 1);
            }}
            className="px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            Decrease
          </button>
          <button 
            onClick={() => {
              setCount(c => c + 1);
              console.log('Increased count to', count + 1);
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Increase
          </button>
        </div>
        
        <div className="mt-8 text-xs text-gray-400">
          Try editing the source code!
        </div>
      </div>
    </div>
  );
}`;

// Mock Fetch for SEO Demo
const fetchArtifact = (id?: string) => {
  return DEFAULT_CODE; // Simulate fetching artifact by ID
};

// ---------------------------------------------------------------------------
// NEXT.JS APP ROUTER MOCK ADAPTER
// The following exports are what you WOULD use in Next.js (App Router).
// In this Vite app, they are here for demonstration and structurally ready.
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: { id: string } }) {
  const code = fetchArtifact(params.id);
  const info = analyzeCode(code);

  return {
    title: `${info.title} - Built with React & Tailwind`,
    description: `View source code for ${info.title}. Uses ${info.dependencies.join(', ')}. Size: ${info.sizeKB}KB.`,
    keywords: ['react', 'component', ...info.dependencies],
    openGraph: {
      title: info.title,
      description: `View source code for ${info.title}`,
    }
  };
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// In Next.js, this would be `export default async function Page(...)`
// Here, we keep it synchronous for Vite compatibility, but simulate the Server Component structure.
// ---------------------------------------------------------------------------

export default function ArtifactViewerPage() {
  // In a real SSR app, these would run on the server.
  const code = fetchArtifact('default'); 
  const info = useMemo(() => analyzeCode(code), [code]);

  // JSON-LD for Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    'name': info.title,
    'programmingLanguage': 'TypeScript',
    'codeSampleType': 'full (compileable)',
    'text': code,
    'dateCreated': new Date().toISOString(),
    'author': {
        '@type': 'Person',
        'name': 'Artifact Creator'
    }
  };

  // Client-side effect to update title (Shim for SSR Metadata)
  React.useEffect(() => {
    document.title = `${info.title} - Artifact Viewer`;
    // We could inject meta tags here too for full simulation, 
    // but the key takeaway is the SEO structure below.
  }, [info.title]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Inject JSON-LD (Works for Google even if Client Rendered sometimes, provided it's in the DOM) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2. Client-Side Interactive Viewer */}
      <ClientArtifactViewer fileContent={code} />

      {/* 3. SEO Content Section (Visible to Bots, useful for Users too) */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex items-baseline justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{info.title}</h1>
            <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">React</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">Tailwind CSS</span>
              {info.dependencies.map(dep => (
                <span key={dep} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100">
                  {dep}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Statistics</h3>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-600">File Size</span>
                  <span className="font-mono font-bold text-gray-900">{info.sizeKB} KB</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-600">Lines of Code</span>
                  <span className="font-mono font-bold text-gray-900">{info.lines}</span>
                </div>
             </div>
          </div>
          
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Status</h3>
             <div className="text-green-600 font-bold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Optimized
             </div>
             <p className="text-xs text-gray-400 mt-1">JSON-LD Injected</p>
          </div>
        </div>

        {/* 4. Static Code Block for Crawlers (Using Details to keep UI clean) */}
        <details className="group bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
           <summary className="cursor-pointer p-4 text-slate-400 hover:text-white font-medium flex items-center justify-between transition-colors select-none">
             <span>View Raw Source (SEO Crawlable)</span>
             <span className="text-xs bg-slate-800 px-2 py-1 rounded group-open:bg-slate-700">Expand</span>
           </summary>
           <div className="p-4 border-t border-slate-800 overflow-x-auto">
                <pre className="text-xs text-slate-300 font-mono leading-relaxed">
                    <code>{code}</code>
                </pre>
           </div>
        </details>
      </section>
    </main>
  );
}
