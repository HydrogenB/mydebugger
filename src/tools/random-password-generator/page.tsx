import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';
import GeneratorPanel from './components/GeneratorPanel';
import { Helmet } from 'react-helmet-async';

const RandomPasswordGeneratorPage: React.FC = () => {
  const tool = getToolByRoute('/random-password-generator');

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': ['FAQPage', 'SoftwareApplication'],
            name: 'Random Password Generator',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web Browser',
            url: 'https://mydebugger.vercel.app/random-password-generator',
            description:
              'Generate strong passwords, UUIDs, and cryptographic keys locally in your browser. Nothing is stored or transmitted.',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Is this password generator safe to use?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'Yes. All values are generated locally using the Web Crypto API (window.crypto.getRandomValues). We never transmit or store any output.',
                },
              },
              {
                '@type': 'Question',
                name: 'What makes a strong password?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'Length (16+), randomness, and variety of character sets. Avoid reuse, consider excluding ambiguous characters, and store with a trusted manager.',
                },
              },
            ],
          })}
        </script>
      </Helmet>
      <ToolLayout
        tool={tool!}
        title="Random Password Generator"
        description="Generate strong passwords, UUIDs, and cryptographic keys locally in your browser. Secure, fast, and copy with one click."
      >
        <GeneratorPanel />
      </ToolLayout>
    </>
  );
};

export default RandomPasswordGeneratorPage;


