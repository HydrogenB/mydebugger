import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Tabs } from '../../design-system/components/navigation';
import { Button } from '../../design-system/components/inputs';
import { Card } from '../../design-system/components/layout';
import { LoadingSpinner } from '../../design-system/components/feedback';
import { Alert } from '../../design-system/components/feedback/Alert';

// Import sections
import BasicInfoSection from './sections/BasicInfoSection';
import SocialLinksSection from './sections/SocialLinksSection';
import CustomLinksSection from './sections/CustomLinksSection';
import ServicesSection from './sections/ServicesSection';
import PortfolioSection from './sections/PortfolioSection';
import AppearanceSection from './sections/AppearanceSection';
import SkillsSection from './sections/SkillsSection';
import TestimonialsSection from './sections/TestimonialsSection';
import SeoSection from './sections/SeoSection';

const VCardEditor = () => {
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState('basic-info');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [vcard, setVcard] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Fetch vcard data if it exists
  useEffect(() => {
    if (status === 'authenticated') {
      fetchVCard();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  const fetchVCard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vcard');
      if (response.ok) {
        const data = await response.json();
        setVcard(data);
      } else {
        const errorData = await response.json();
        console.log("API response error:", errorData);
        // Don't set error here, as 404 is expected for new users
      }
    } catch (error) {
      console.error('Error fetching vcard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (sectionData) => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      let endpoint = '/api/vcard';
      let method = vcard ? 'PUT' : 'POST';
      let updatedData = vcard ? { ...vcard, ...sectionData } : sectionData;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setVcard(data);
      setSuccess('VCard saved successfully! Your changes are now live.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      const response = await fetch('/api/vcard', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete VCard');
      }
      
      setVcard(null);
      setSuccess('Your VCard has been deleted successfully');
      setShowConfirmDelete(false);
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Card isElevated>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-6">You need to sign in to create or edit your VCard.</p>
          <Button
            variant="primary"
            onClick={() => signIn('google')}
          >
            Sign in with Google
          </Button>
        </div>
      </Card>
    );
  }

  const sections = [
    { id: 'basic-info', label: 'Basic Info' },
    { id: 'social-links', label: 'Social Links' },
    { id: 'custom-links', label: 'Custom Links' },
    { id: 'skills', label: 'Skills' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'seo', label: 'SEO Settings' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'basic-info':
        return <BasicInfoSection vcard={vcard} onSave={handleSave} />;
      case 'social-links':
        return <SocialLinksSection vcard={vcard} onSave={handleSave} />;
      case 'custom-links':
        return <CustomLinksSection vcard={vcard} onSave={handleSave} />;
      case 'skills':
        return <SkillsSection vcard={vcard} onSave={handleSave} />;
      case 'services':
        return <ServicesSection vcard={vcard} onSave={handleSave} />;
      case 'portfolio':
        return <PortfolioSection vcard={vcard} onSave={handleSave} />;
      case 'testimonials':
        return <TestimonialsSection vcard={vcard} onSave={handleSave} />;
      case 'appearance':
        return <AppearanceSection vcard={vcard} onSave={handleSave} />;
      case 'seo':
        return <SeoSection vcard={vcard} onSave={handleSave} />;
      default:
        return <BasicInfoSection vcard={vcard} onSave={handleSave} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Support/Donation Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-indigo-800">Support VCard Development</h3>
            <p className="text-sm text-indigo-600">
              This service is free to use, but server costs add up. If you find it useful, please consider buying me a coffee!
            </p>
          </div>
          <a 
            href="https://buymeacoffee.com/jiradbirdp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-3 md:mt-0 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium transition-colors"
          >
            Buy Me a Coffee
          </a>
        </div>
      </div>
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Smart VCard Editor</h1>
        <p className="text-gray-600">
          Create and customize your digital business card that you can share with anyone
        </p>
      </div>
      
      {error && <Alert type="error" className="mb-6">{error}</Alert>}
      {success && <Alert type="success" className="mb-6">{success}</Alert>}
      
      <Card>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto scrollbar-thin">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeSection === section.id 
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {renderSection()}
        </div>
      </Card>
      
      {/* Preview and Management Buttons */}
      <div className="mt-6 flex flex-col md:flex-row justify-between">
        {vcard && (
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <a 
              href={`/${vcard.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button variant="primary">
                View Your VCard
              </Button>
            </a>
            <Button 
              variant="danger" 
              onClick={() => setShowConfirmDelete(true)}
            >
              Delete VCard
            </Button>
          </div>
        )}
        
        <div className="text-sm text-gray-500 italic">
          Last updated: {vcard ? new Date(vcard.updatedAt).toLocaleDateString() : 'Not yet created'}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete VCard?</h3>
            <p className="mb-6">
              Are you sure you want to delete your VCard? This action cannot be undone.
              All your data, analytics, and customizations will be lost.
            </p>
            <div className="flex justify-end space-x-4">
              <Button 
                variant="secondary" 
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VCardEditor;
