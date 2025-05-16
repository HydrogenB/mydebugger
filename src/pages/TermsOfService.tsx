import React from 'react';
import { Helmet } from 'react-helmet';
import { ResponsiveContainer } from '../design-system/components/layout';

const TermsOfService: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | MyDebugger</title>
        <meta name="description" content="Terms of service for MyDebugger - please read carefully before using our tools" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <ResponsiveContainer maxWidth="4xl" className="py-12">
        <div className="prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-400 max-w-none">
          <h1>Terms of Service</h1>
          <p className="lead">Last updated: May 17, 2025</p>
          
          <h2>Introduction</h2>
          <p>
            Welcome to MyDebugger. These Terms of Service govern your use of our website located at 
            <a href="https://mydebugger.vercel.app" target="_blank" rel="noopener noreferrer"> mydebugger.vercel.app</a> and all associated tools.
          </p>
          <p>
            By accessing this website, we assume you accept these terms of service. Do not continue to use MyDebugger if you do not agree to all of the terms stated on this page.
          </p>
          
          <h2>Use License</h2>
          <p>
            MyDebugger is an open-source project. The source code is available under the MIT License, which can be found in the GitHub repository.
          </p>
          <p>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.
          </p>
          
          <h2>Disclaimer</h2>
          <p>
            The tools and services provided by MyDebugger are provided "as is" without any warranty of any kind, either expressed or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
          <p>
            MyDebugger does not warrant that the website will be uninterrupted, timely, secure, or error-free, or that defects, if any, will be corrected. We make no warranties as to the results that may be obtained from the use of the service or as to the accuracy or reliability of any information obtained through the service.
          </p>
          
          <h2>Data Processing</h2>
          <p>
            MyDebugger's tools process data client-side in your browser. Any data you enter into our tools is not sent to our servers unless explicitly stated otherwise. However, you use these tools at your own risk. We recommend not using sensitive production data with these tools.
          </p>
          
          <h2>Limitations</h2>
          <p>
            In no event shall MyDebugger or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MyDebugger's website, even if MyDebugger or a MyDebugger authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          <p>
            Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
          </p>
          
          <h2>External Links</h2>
          <p>
            MyDebugger may contain links to external websites that are not provided or maintained by or in any way affiliated with us. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
          </p>
          
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms of service at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website.
          </p>
          
          <h2>Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul>
            <li>By visiting the GitHub repository: <a href="https://github.com/HydrogenB/mydebugger/issues" target="_blank" rel="noopener noreferrer">https://github.com/HydrogenB/mydebugger/issues</a></li>
          </ul>
        </div>
      </ResponsiveContainer>
    </>
  );
};

export default TermsOfService;
