import React from 'react';
import { Helmet } from 'react-helmet-async';
import SEOMeta from '../components/SEOMeta';
import { pageSEO } from '../config/seo.config';
import { ResponsiveContainer } from '../design-system/components/layout';

const PrivacyPolicy: React.FC = () => {
  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - MyDebugger Data Protection",
    "description": "Comprehensive privacy policy for MyDebugger debugging platform, covering data collection, usage, GDPR compliance, and user rights",
    "url": "https://mydebugger.vercel.app/privacy",
    "lastReviewed": "2025-08-03",
    "publisher": {
      "@type": "Organization",
      "name": "MyDebugger",
      "url": "https://mydebugger.vercel.app"
    },
    "about": {
      "@type": "Thing",
      "name": "Privacy Policy"
    }
  };

  return (
    <>
      <SEOMeta seo={pageSEO.privacy} path="/privacy" />
      <Helmet>
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="revisit-after" content="30 days" />
        <meta name="distribution" content="global" />
        <meta name="language" content="en" />
        <meta name="coverage" content="worldwide" />
        <meta name="subject" content="Privacy Policy" />
        <meta name="classification" content="Privacy Policy" />
        <meta name="resource-type" content="document" />
        <meta name="doc-type" content="Web Page" />
        <meta name="doc-rights" content="public" />
        <meta name="doc-publisher" content="MyDebugger" />
        <script type="application/ld+json">
          {JSON.stringify(privacySchema)}
        </script>
      <ResponsiveContainer maxWidth="4xl" className="py-12">
        <div className="prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-400 max-w-none">
          <h1>Privacy Policy - MyDebugger Data Protection & Privacy Rights</h1>
          <p className="lead text-lg text-gray-600 dark:text-gray-400">Last updated: August 3, 2025</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Effective Date: August 3, 2025</p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Quick Privacy Summary</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li><strong>Client-side processing:</strong> All data processing happens in your browser</li>
              <li><strong>No data transmission:</strong> Your data never leaves your device</li>
              <li><strong>Local storage only:</strong> Preferences saved locally on your device</li>
              <li><strong>GDPR compliant:</strong> Full compliance with European privacy regulations</li>
              <li><strong>Cookie-free:</strong> No tracking cookies or third-party data collection</li>
            </ul>
          </div>
          
          <h2>Introduction to MyDebugger Privacy Practices</h2>
          <p>
            MyDebugger ("we", "our", or "us") is committed to protecting your privacy and ensuring the highest standards of data protection. This comprehensive Privacy Policy explains in detail how we collect, use, disclose, and safeguard your information when you visit our debugging platform at <a href="https://mydebugger.vercel.app">https://mydebugger.vercel.app</a>.
          </p>
          <p>
            We operate under a strict <strong>client-side processing model</strong>, which means that all data processing occurs directly in your web browser. Your sensitive data, including code, tokens, and debugging information, never leaves your device or is transmitted to our servers.
          </p>
          <p>
            This Privacy Policy applies to all users worldwide, with special attention to compliance with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other relevant privacy laws. By accessing MyDebugger, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">What We DON'T Do</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>❌ No server-side data storage</li>
                <li>❌ No data transmission to third parties</li>
                <li>❌ No tracking cookies</li>
                <li>❌ No personal data collection</li>
                <li>❌ No selling of user data</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What We DO</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>✅ Client-side data processing</li>
                <li>✅ Local preference storage</li>
                <li>✅ Transparent privacy practices</li>
                <li>✅ GDPR compliance</li>
                <li>✅ User control over all data</li>
              </ul>
            </div>
          </div>
          
          <h2>Detailed Information Collection Practices</h2>
          
          <h3>Information You Provide - Client-Side Processing</h3>
          <p>
            MyDebugger operates on a revolutionary <strong>zero-data-collection model</strong>. All tools function entirely through client-side processing, which means:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Code Analysis:</strong> Your source code is analyzed directly in your browser without transmission to any server</li>
            <li><strong>Token Decoding:</strong> JWT tokens, API keys, and sensitive information are processed locally</li>
            <li><strong>Debugging Data:</strong> All debugging information remains exclusively on your device</li>
            <li><strong>Performance Metrics:</strong> Code performance analysis occurs client-side without data transmission</li>
            <li><strong>Security Scanning:</strong> Security vulnerability detection happens entirely in your browser</li>
          </ul>
          
          <h3>Automatically Collected Information - Technical Data</h3>
          <p>
            While we maintain strict privacy standards, we may collect minimal technical information to ensure optimal service delivery:
          </p>
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Storage</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">IP Address</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Security & Performance</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Temporary logs (30 days)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Browser Type</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Compatibility optimization</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Analytics aggregation</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Device Information</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Responsive design optimization</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Aggregated statistics</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Operating System</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">User experience optimization</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Aggregated analytics</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h2>Local Storage & Browser Data Management</h2>
          <p>
            MyDebugger utilizes browser local storage exclusively for enhancing user experience while maintaining complete privacy:
          </p>
          
          <h3>Types of Local Storage Data</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>User Preferences:</strong> Theme selection (light/dark mode), language preferences, and UI settings</li>
            <li><strong>Tool State:</strong> Last used tools, pinned tools, and recently accessed features</li>
            <li><strong>Layout Preferences:</strong> Grid vs list view, collapsed/expanded sections</li>
            <li><strong>Search History:</strong> Recent search queries (stored locally for convenience)</li>
          </ul>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 my-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Important Note</h4>
            <p className="text-yellow-700 dark:text-yellow-300">
              All local storage data remains exclusively on your device. We have no access to this information, and it is never transmitted to our servers or any third parties. You maintain complete control over this data and can clear it at any time through your browser settings.
            </p>
          </div>
          
          <h2>Analytics & Performance Monitoring</h2>
          <p>
            We employ privacy-focused analytics to understand how users interact with MyDebugger while maintaining strict data protection standards:
          </p>
          
          <h3>Privacy-First Analytics Approach</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Anonymous Data:</strong> All analytics data is anonymized and aggregated</li>
            <li><strong>No Personal Identifiers:</strong> We do not collect names, email addresses, or personal identifiers</li>
            <li><strong>GDPR Compliance:</strong> Full compliance with European data protection regulations</li>
            <li><strong>User Control:</strong> Easy opt-out mechanisms for all tracking</li>
            <li><strong>Data Minimization:</strong> We collect only essential usage metrics</li>
          </ul>
          
          <h3>Analytics Service Providers</h3>
          <div className="my-4">
            <h4>Google Analytics (Privacy-Enhanced)</h4>
            <p>
              We utilize Google Analytics with enhanced privacy settings including IP anonymization, data retention limits, and user opt-out capabilities. Google Analytics helps us understand:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Which tools are most popular among developers</li>
              <li>User experience optimization opportunities</li>
              <li>Performance bottlenecks and improvements</li>
              <li>Device compatibility issues</li>
            </ul>
          </div>
          
          <h3>Opt-Out Options</h3>
          <p>
            We respect your privacy preferences and provide multiple opt-out mechanisms:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Browser Add-ons:</strong> Google Analytics opt-out browser extension</li>
            <li><strong>Do Not Track:</strong> Respect for browser Do Not Track signals</li>
            <li><strong>Cookie Settings:</strong> Granular cookie management options</li>
            <li><strong>Contact Us:</strong> Direct privacy requests via email</li>
          </ul>
          </p>
          
          <h2>Links to Other Websites</h2>
          <p>
            Our website may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
          </p>
          <p>
            We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>
          
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
          
          <h2>GDPR Compliance & User Rights</h2>
          <p>
            As a user of MyDebugger, you have specific rights under the General Data Protection Regulation (GDPR) and similar privacy laws:
          </p>
          
          <h3>Your Privacy Rights Include</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Right to Access:</strong> Request information about what data we hold about you</li>
            <li><strong>Right to Rectification:</strong> Correct any inaccurate personal data</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
            <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
            <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Right to Object:</strong> Object to processing of your data</li>
          </ul>
          
          <h2>Contact Information & Data Protection Officer</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg my-4">
            <h3>Data Protection Officer (DPO)</h3>
            <p><strong>Name:</strong> Privacy Team</p>
            <p><strong>Email:</strong> <a href="mailto:privacy@mydebugger.vercel.app" className="text-primary-600 dark:text-primary-400 hover:underline">privacy@mydebugger.vercel.app</a></p>
            <p><strong>Response Time:</strong> Within 30 days of receiving your request</p>
            <p><strong>Business Address:</strong> MyDebugger Privacy Team, Digital Services Division</p>
          </div>
          
          <h2>International Data Transfers</h2>
          <p>
            MyDebugger operates globally while maintaining strict data protection standards. All data processing occurs within your browser, ensuring that your information never leaves your jurisdiction. We comply with international data transfer regulations including:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>EU-US Privacy Shield framework</li>
            <li>Swiss-US Privacy Shield framework</li>
            <li>Standard Contractual Clauses (SCCs)</li>
            <li>Binding Corporate Rules (BCRs)</li>
          </ul>
          
          <h2>Policy Updates & Changes</h2>
          <p>
            We regularly update this Privacy Policy to reflect changes in our practices, legal requirements, and user feedback. When we make changes, we will:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Update the "Last Updated" date at the top of this policy</li>
            <li>Provide prominent notice on our homepage</li>
            <li>Send email notifications to registered users (if applicable)</li>
            <li>Maintain a changelog of significant policy updates</li>
          </ul>
          
          <div className="text-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This Privacy Policy was last updated on August 3, 2025, and is reviewed quarterly to ensure continued compliance with evolving privacy regulations.
            </p>
          </div>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul>
            <li>By visiting the GitHub repository: <a href="https://github.com/HydrogenB/mydebugger/issues" target="_blank" rel="noopener noreferrer">https://github.com/HydrogenB/mydebugger/issues</a></li>
          </ul>
        </div>
      </ResponsiveContainer>
    </>
  );
};

export default PrivacyPolicy;
