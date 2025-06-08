import React from 'react';
import { Helmet } from 'react-helmet';
import { ResponsiveContainer } from '../design-system/components/layout';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | MyDebugger</title>
        <meta name="description" content="Privacy policy for MyDebugger - our commitment to protecting your privacy" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <ResponsiveContainer maxWidth="4xl" className="py-12">
        <div className="prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-400 max-w-none">
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: May 17, 2025</p>
          
          <h2>Introduction</h2>
          <p>
            MyDebugger ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
          
          <h2>Information We Collect</h2>
          <h3>Information You Provide</h3>
          <p>
            All tools on MyDebugger work client-side. This means that any data you enter into our tools is processed in your browser and is not sent to or stored on our servers.
          </p>
          
          <h3>Automatically Collected Information</h3>
          <p>
            When you visit our website, we may collect certain information automatically from your device. This information may include your IP address, device information, browser type, and operating system. This information is used to improve our website and services.
          </p>
          
          <h2>Local Storage</h2>
          <p>
            Some of our tools may use local storage to save your preferences or tool state for your convenience. This data remains on your device and is not accessible to us or any third parties.
          </p>
          
          <h2>Analytics</h2>
          <p>
            We may use third-party Service Providers to monitor and analyze the use of our website.
          </p>
          <p>
            Google Analytics is a web analytics service offered by Google that tracks and reports website traffic. Google uses the data collected to track and monitor the use of our website. This data is shared with other Google services. Google may use the collected data to contextualize and personalize the ads of its own advertising network.
          </p>
          <p>
            You can opt-out of having made your activity on the website available to Google Analytics by installing the Google Analytics opt-out browser add-on.
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
