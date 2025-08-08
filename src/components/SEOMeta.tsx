import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOConfig } from '../config/seo.config';

interface SEOMetaProps {
  seo: SEOConfig;
  path?: string;
}

const SEOMeta: React.FC<SEOMetaProps> = ({ seo, path = '' }) => {
  const canonicalUrl = `https://mydebugger.vercel.app${path}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      <meta name="author" content={seo.author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={seo.og.title} />
      <meta property="og:description" content={seo.og.description} />
      <meta property="og:type" content={seo.og.type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={seo.og.image} />
      <meta property="og:site_name" content={seo.og.siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={seo.twitter.card} />
      <meta name="twitter:title" content={seo.twitter.title} />
      <meta name="twitter:description" content={seo.twitter.description} />
      <meta name="twitter:image" content={seo.twitter.image} />
      <meta name="twitter:site" content={seo.twitter.creator} />
      <meta name="twitter:creator" content={seo.twitter.creator} />
      
      {/* Additional SEO Tags */}
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="language" content="en" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(seo.structuredData)}
      </script>
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    </Helmet>
  );
};

export default SEOMeta;
