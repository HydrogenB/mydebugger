import React from 'react';
import SEOMeta from '../components/SEOMeta';
import { ResponsiveContainer } from '../design-system/components/layout';

const TermsOfService: React.FC = () => {
  const termsSEO = {
    title: 'Terms of Service - MyDebugger Development Platform',
    description: 'Comprehensive terms of service for MyDebugger development tools platform. Read our legal terms and conditions carefully.',
    keywords: ['terms of service', 'TOS', 'legal agreement', 'software license', 'MIT license', 'open source terms', 'developer tools terms'],
    author: 'MyDebugger Team',
    og: {
      title: 'Terms of Service - MyDebugger',
      description: 'Complete terms of service for using MyDebugger development tools including licensing, disclaimers, data processing, and user responsibilities.',
      url: 'https://mydebugger.vercel.app/terms',
      type: 'website',
      image: 'https://mydebugger.vercel.app/og/terms.jpg',
      siteName: 'MyDebugger'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Terms of Service - MyDebugger',
      description: 'Legal terms and conditions for MyDebugger development tools platform',
      image: 'https://mydebugger.vercel.app/twitter/terms.jpg',
      creator: '@jirads'
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Terms of Service - MyDebugger',
      'description': 'Comprehensive terms of service for MyDebugger development tools platform. Read our legal terms and conditions carefully.',
      'url': 'https://mydebugger.vercel.app/terms',
      'lastReviewed': '2025-05-17',
      'publisher': {
        '@type': 'Organization',
        'name': 'MyDebugger',
        'url': 'https://mydebugger.vercel.app',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://mydebugger.vercel.app/logo.png',
          'width': 512,
          'height': 512
        }
      },
      'mainEntity': {
        '@type': 'Article',
        '@id': 'https://mydebugger.vercel.app/terms#main-article',
        'headline': 'MyDebugger Terms of Service - Legal Terms and Conditions',
        'description': 'Complete terms of service for using MyDebugger development tools including licensing, disclaimers, data processing, and user responsibilities.',
        'articleBody': 'MyDebugger Terms of Service govern your use of our comprehensive development tools platform including JWT decoder, QR code generator, code formatter, and debugging utilities.',
        'author': {
          '@type': 'Person',
          'name': 'MyDebugger Team'
        },
        'datePublished': '2025-05-17',
        'dateModified': '2025-05-17',
        'wordCount': 2500,
        'articleSection': 'Legal',
        'keywords': ['terms of service', 'TOS', 'legal agreement', 'software license', 'MIT license', 'open source terms', 'developer tools terms']
      }
    }
  };

  return (
    <>
      <SEOMeta seo={termsSEO} path="/terms-of-service" />
      <ResponsiveContainer maxWidth="4xl" className="py-12">
        <div className="prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-400 max-w-none">
          <h1>Terms of Service - MyDebugger Development Platform</h1>
          <p className="lead text-lg text-gray-600 dark:text-gray-400">
            Last updated: May 17, 2025 | Effective date: May 17, 2025
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> By accessing or using MyDebugger, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.
            </p>
          </div>

          <section id="introduction">
            <h2>1. Introduction and Platform Overview</h2>
            <p>
              <strong>MyDebugger</strong> is a comprehensive development tools platform designed to provide developers with essential utilities for debugging, code analysis, and development workflow optimization. Our platform offers over 50 specialized tools including JWT token decoders, QR code generators, code formatters, regex testers, and performance monitoring utilities.
            </p>
            <p>
              These Terms of Service govern your access to and use of the MyDebugger website located at <a href="https://mydebugger.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://mydebugger.vercel.app</a> and all associated tools, services, and content (collectively, the "Service").
            </p>
            <p>
              By accessing or using any part of the Service, you agree to be bound by these Terms. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
            </p>
          </section>

          <section id="eligibility">
            <h2>2. Eligibility and User Requirements</h2>
            <p>
              You must be at least 13 years of age to use MyDebugger. By using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>
            <p>
              If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          <section id="license">
            <h2>3. Software License and Usage Rights</h2>
            <p>
              MyDebugger is released as an open-source project under the <strong>MIT License</strong>. This license grants you the following rights:
            </p>
            <ul>
              <li><strong>Usage Rights:</strong> Permission to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software</li>
              <li><strong>Commercial Use:</strong> You may use the software for commercial purposes</li>
              <li><strong>Modification Rights:</strong> You may modify the software and distribute modified versions</li>
              <li><strong>Patent Rights:</strong> The license provides an express grant of patent rights from contributors</li>
            </ul>
            
            <h3>3.1 License Conditions</h3>
            <p>
              The MIT License requires that the copyright notice and permission notice be included in all copies or substantial portions of the software. You must:
            </p>
            <ul>
              <li>Include the original copyright notice in any redistribution</li>
              <li>Include the MIT License text in any derivative works</li>
              <li>Not hold the authors or copyright holders liable for any claims or damages</li>
            </ul>
          </section>

          <section id="disclaimer">
            <h2>4. Comprehensive Disclaimer and Limitation of Liability</h2>
            
            <h3>4.1 "As Is" Disclaimer</h3>
            <p>
              The MyDebugger platform, tools, and services are provided <strong>"AS IS"</strong> without any warranty of any kind, either express or implied, including but not limited to:
            </p>
            <ul>
              <li>Implied warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement of third-party rights</li>
              <li>Accuracy or completeness of information</li>
              <li>Availability or uptime guarantees</li>
            </ul>

            <h3>4.2 Service Limitations</h3>
            <p>
              MyDebugger does not warrant that:
            </p>
            <ul>
              <li>The website will be uninterrupted, timely, secure, or error-free</li>
              <li>Defects, if any, will be corrected</li>
              <li>The results obtained from using the service will be accurate or reliable</li>
              <li>The quality of any products, services, information, or other material obtained will meet your expectations</li>
              <li>Any errors in the software will be corrected</li>
            </ul>

            <h3>4.3 Limitation of Liability</h3>
            <p>
              In no event shall MyDebugger, its team members, contributors, or suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, business interruption, or any other pecuniary loss) arising out of the use or inability to use the materials on MyDebugger's website, even if MyDebugger or a MyDebugger authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
            <p>
              Because some jurisdictions do not allow limitations on implied warranties or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
            </p>
          </section>

          <section id="data-processing">
            <h2>5. Data Processing and Privacy Model</h2>
            
            <h3>5.1 Client-Side Processing</h3>
            <p>
              MyDebugger's tools process data <strong>client-side</strong> exclusively in your browser. This means:
            </p>
            <ul>
              <li>All data processing occurs locally on your device</li>
              <li>No data is transmitted to our servers unless explicitly stated otherwise</li>
              <li>Your data remains under your complete control</li>
              <li>We cannot access, view, or store any data you process</li>
            </ul>

            <h3>5.2 Data Security Recommendations</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Security Notice:</strong> While we implement security best practices, we recommend that you do not use sensitive production data (such as production API keys, passwords, or confidential information) with our tools. Always use test data or anonymized data when possible.
              </p>
            </div>

            <h3>5.3 Browser Storage</h3>
            <p>
              Our tools may utilize browser local storage or session storage to enhance user experience by:
            </p>
            <ul>
              <li>Saving your preferences and settings</li>
              <li>Maintaining tool state between sessions</li>
              <li>Enabling offline functionality where applicable</li>
            </ul>
            <p>
              This data remains on your device and can be cleared at any time through your browser settings.
            </p>
          </section>

          <section id="intellectual-property">
            <h2>6. Intellectual Property Rights</h2>
            <p>
              All intellectual property rights in the MyDebugger platform, including but not limited to the software, design, graphics, logos, and content (excluding user-generated content), are owned by or licensed to MyDebugger.
            </p>
            <p>
              The MIT License grants you specific rights to use, modify, and distribute the software as outlined in Section 3, while all other rights are reserved.
            </p>
          </section>

          <section id="user-obligations">
            <h2>7. User Obligations and Acceptable Use</h2>
            <p>
              By using MyDebugger, you agree to:
            </p>
            <ul>
              <li>Use the tools only for lawful purposes</li>
              <li>Not use the tools for any malicious activities</li>
              <li>Not attempt to reverse engineer or exploit the tools</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Respect the intellectual property rights of others</li>
            </ul>
          </section>

          <section id="modifications">
            <h2>8. Modifications to Terms and Service</h2>
            <p>
              MyDebugger reserves the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on this page.
            </p>
            <p>
              Your continued use of the Service after any modifications constitutes your acceptance of the revised Terms.
            </p>
            <p>
              We will notify users of significant changes through:
            </p>
            <ul>
              <li>Updates to the "Last updated" date at the top of this page</li>
              <li>Notifications on our website or GitHub repository</li>
            </ul>
          </section>

          <section id="governing-law">
            <h2>9. Governing Law and Jurisdiction</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in the United States.
            </p>
          </section>

          <section id="contact">
            <h2>10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <ul className="space-y-2">
                <li><strong>GitHub Issues:</strong> <a href="https://github.com/HydrogenB/mydebugger/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://github.com/HydrogenB/mydebugger/issues</a></li>
                <li><strong>Repository:</strong> <a href="https://github.com/HydrogenB/mydebugger" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://github.com/HydrogenB/mydebugger</a></li>
              </ul>
            </div>
          </section>

          <section id="acknowledgment">
            <h2>11. Acknowledgment and Acceptance</h2>
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4">
              <p className="text-green-800 dark:text-green-200">
                BY USING MYDEBUGGER, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE. IF YOU DO NOT AGREE, YOU MUST NOT ACCESS OR USE THE SERVICE.
              </p>
            </div>
          </section>

          <div className="text-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These Terms of Service were last updated on May 17, 2025, and are reviewed annually to ensure compliance with evolving legal requirements and industry standards.
            </p>
          </div>
        </div>
      </ResponsiveContainer>
    </>
  );
};

export default TermsOfService;
