
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
    <div className="bg-gray-50 flex flex-col w-full">
      {/* 1. Inject JSON-LD (Works for Google even if Client Rendered sometimes, provided it's in the DOM) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2. Client-Side Interactive Viewer */}
      <ClientArtifactViewer fileContent={code} />

      {/* 3. SEO Content Section (Visible to Bots, useful for Users too) */}
      {/* User requested to remove extra functions, so we hide the visible SEO stats but keep metadata */}
    </div>
  );
}
