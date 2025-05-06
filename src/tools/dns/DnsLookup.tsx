import React from 'react';
import { Helmet } from 'react-helmet';

const DnsLookup: React.FC = () => {
  // SEO metadata
  const pageTitle = "DNS Lookup Tool | MyDebugger";
  const pageDescription = "Query DNS records for any domain name.";
  
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/dns-check" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/dns-check" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">DNS Lookup Tool</h1>
        <p className="text-gray-600 mb-8">
          Query DNS records for any domain name.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
          <p className="text-lg text-blue-800">
            Coming Soon! This tool is currently under development.
          </p>
        </div>
        
        {/* Related Tools */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Try Our Other Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/jwt"
              className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-medium text-lg mb-1">JWT Decoder</h3>
              <p className="text-gray-600">Decode and verify JSON Web Tokens (JWT) instantly.</p>
            </a>
            <a
              href="/url-encoder"
              className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-medium text-lg mb-1">URL Encoder/Decoder</h3>
              <p className="text-gray-600">Encode or decode URL components safely.</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default DnsLookup;