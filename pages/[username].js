import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import VCardView from '../src/components/vcard/VCardView';
import { LoadingSpinner } from '../src/design-system/components/feedback';

// Initialize Prisma client
const prisma = new PrismaClient();

export default function VCardPage({ vcard, error }) {
  const router = useRouter();
  const { username } = router.query;
  
  // Show loading state during fallback
  if (router.isFallback) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // If there was an error loading the VCard, it will be passed via props
  if (error || !vcard) {
    return (
      <>
        <Head>
          <title>VCard Not Found</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <VCardView username={username} />
      </>
    );
  }
  
  // Meta tags for proper SEO
  const pageTitle = vcard.metaTitle || `${vcard.displayName} - Digital Business Card`;
  const pageDescription = vcard.metaDescription || 
    `Connect with ${vcard.displayName}${vcard.title ? ` - ${vcard.title}` : ''}. View contact information, portfolio, and more.`;
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://mydebugger.vercel.app/${vcard.username}`} />
        {vcard.profileImage && <meta property="og:image" content={`https://mydebugger.vercel.app${vcard.profileImage}`} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {vcard.profileImage && <meta name="twitter:image" content={`https://mydebugger.vercel.app${vcard.profileImage}`} />}
        
        {/* If user has a Google Analytics ID, include it */}
        {vcard.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${vcard.googleAnalyticsId}`}></script>
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${vcard.googleAnalyticsId}');
              `
            }} />
          </>
        )}
        
        <link rel="canonical" href={`https://mydebugger.vercel.app/${vcard.username}`} />
      </Head>
      
      <VCardView username={username} />
    </>
  );
}

export const getServerSideProps = async ({ params }) => {
  const { username } = params;
  
  try {
    // Pre-fetch vcard data for SEO benefits
    const vcard = await prisma.vCard.findUnique({
      where: { username },
      select: {
        username: true,
        displayName: true,
        title: true,
        profileImage: true,
        metaTitle: true,
        metaDescription: true,
        googleAnalyticsId: true,
        isPublic: true
      }
    });
    
    // If vcard doesn't exist or is not public, return error
    if (!vcard || !vcard.isPublic) {
      return {
        props: { error: 'VCard not found or is private', vcard: null }
      };
    }
    
    // Track view in analytics
    try {
      await prisma.vCard.update({
        where: { username },
        data: { viewCount: { increment: 1 } }
      });
    } catch (e) {
      console.error('Failed to update view count:', e);
      // Don't fail the request if analytics update fails
    }
    
    // Return the basic vcard data needed for meta tags
    return {
      props: { 
        vcard: JSON.parse(JSON.stringify(vcard)) // Sanitize for JSON serialization
      }
    };
  } catch (error) {
    console.error('Error loading VCard:', error);
    return {
      props: { error: 'Failed to load VCard', vcard: null }
    };
  }
};
