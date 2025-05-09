import React from 'react';
import Head from 'next/head';
import { getSession } from 'next-auth/react';
import VCardEditor from '../../src/components/vcard/VCardEditor';
import { Card } from '../../src/design-system/components/layout';

export default function VCardEditorPage() {
  return (
    <>
      <Head>
        <title>Smart VCard Editor - Create Your Digital Business Card</title>
        <meta name="description" content="Create and customize your digital business card to share your professional profile with anyone." />
        <meta property="og:title" content="Smart VCard Editor - Create Your Digital Business Card" />
        <meta property="og:description" content="Create and customize your digital business card to share your professional profile with anyone." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/vcard/editor" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <VCardEditor />
        
        {/* Additional information section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">About Smart VCards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-2">Create Once, Share Everywhere</h3>
              <p className="text-gray-600">
                Your digital business card works everywhere. Share via QR code, email, or messaging apps.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-2">Professional Landing Pages</h3>
              <p className="text-gray-600">
                Showcase your skills, services, portfolio, and testimonials in one professional profile.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-2">Analytics & Insights</h3>
              <p className="text-gray-600">
                Track views, downloads, and link clicks to understand how people engage with your card.
              </p>
            </Card>
          </div>
          
          <div className="mt-8 bg-blue-50 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Support This Project</h3>
            <p className="mb-4">
              This service is provided free of charge, but server costs and ongoing development require resources.
              If you find this service useful, please consider supporting the developer.
            </p>
            <a
              href="https://buymeacoffee.com/jiradbirdp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium transition-colors"
            >
              ☕ Buy Me a Coffee
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// Ensure users are logged in to access this page
export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
  
  return {
    props: { session }
  };
}
