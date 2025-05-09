import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Card } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { LoadingSpinner } from '../../design-system/components/feedback';
import { Alert } from '../../design-system/components/feedback/Alert';
import GoogleLoginButton from '../auth/GoogleLoginButton';

// Form sections
import BasicInfoSection from './editor/BasicInfoSection';
import SocialLinksSection from './editor/SocialLinksSection';
import SkillsSection from './editor/SkillsSection';
import EducationSection from './editor/EducationSection';
import ExperienceSection from './editor/ExperienceSection';
import AppearanceSection from './editor/AppearanceSection';

// Define types for our form data
interface NameCardFormData {
  username: string;
  displayName: string;
  title: string;
  bio: string;
  email: string;
  phoneNumber: string;
  website: string;
  location: string;
  company: string;
  avatarUrl: string;
  coverImageUrl: string;
  theme: string;
  isPublic: boolean;
  socialLinks: {
    platform: string;
    url: string;
    displayOrder?: number;
  }[];
  skills: {
    name: string;
    proficiency?: number;
    displayOrder?: number;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    displayOrder?: number;
  }[];
  experience: {
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    displayOrder?: number;
  }[];
}

export default function NameCardEditor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState('basic-info');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingNameCard, setExistingNameCard] = useState(null);
  
  // Initialize form data
  const [formData, setFormData] = useState<NameCardFormData>({
    username: '',
    displayName: '',
    title: '',
    bio: '',
    email: '',
    phoneNumber: '',
    website: '',
    location: '',
    company: '',
    avatarUrl: '',
    coverImageUrl: '',
    theme: 'default',
    isPublic: true,
    socialLinks: [{ platform: '', url: '' }],
    skills: [{ name: '' }],
    education: [],
    experience: []
  });

  // Load existing namecard data if available
  useEffect(() => {
    async function loadExistingNameCard() {
      if (status !== 'authenticated') return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/namecard');
        if (response.ok) {
          const data = await response.json();
          setExistingNameCard(data);
          
          // Populate form with existing data
          setFormData({
            username: data.username || '',
            displayName: data.displayName || '',
            title: data.title || '',
            bio: data.bio || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            website: data.website || '',
            location: data.location || '',
            company: data.company || '',
            avatarUrl: data.avatarUrl || '',
            coverImageUrl: data.coverImageUrl || '',
            theme: data.theme || 'default',
            isPublic: data.isPublic !== undefined ? data.isPublic : true,
            socialLinks: data.socialLinks?.length > 0 ? data.socialLinks : [{ platform: '', url: '' }],
            skills: data.skills?.length > 0 ? data.skills : [{ name: '' }],
            education: data.education || [],
            experience: data.experience || []
          });
        }
      } catch (err) {
        console.error('Error loading namecard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadExistingNameCard();
  }, [status]);

  // Pre-populate email and name if available from session
  useEffect(() => {
    if (session?.user && !existingNameCard) {
      setFormData(prev => ({
        ...prev,
        displayName: session.user.name || '',
        email: session.user.email || '',
        avatarUrl: session.user.image || ''
      }));
    }
  }, [session, existingNameCard]);

  const handleChange = (section: keyof NameCardFormData, updatedData: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: updatedData
    }));
  };

  const handleSave = async () => {
    // Validate form data
    if (!formData.username || !formData.displayName) {
      setError('Username and display name are required');
      return;
    }
    
    if (formData.socialLinks.some(link => (link.platform && !link.url) || (!link.platform && link.url))) {
      setError('Social links must have both platform and URL');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Clean up form data - remove empty entries
      const cleanedData = {
        ...formData,
        socialLinks: formData.socialLinks.filter(link => link.platform && link.url),
        skills: formData.skills.filter(skill => skill.name)
      };
      
      const url = '/api/namecard';
      const method = existingNameCard ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setSuccess('Name card saved successfully!');
      
      // If this was a new namecard, update the state to reflect we now have one
      if (!existingNameCard) {
        setExistingNameCard(data);
      }
      
      // Redirect to the view page after a short delay
      setTimeout(() => {
        router.push(`/${data.username}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save name card');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Card isElevated className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Sign in to create your name card</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You need to be signed in to create and manage your name card.
        </p>
        <GoogleLoginButton redirectTo="/namecard/edit" fullWidth />
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card isElevated className="mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold">
            {existingNameCard ? 'Edit Your Name Card' : 'Create Your Name Card'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a beautiful digital name card to share your professional identity.
          </p>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setActiveStep('basic-info')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeStep === 'basic-info' 
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveStep('social')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeStep === 'social' 
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Social Links
            </button>
            <button
              onClick={() => setActiveStep('skills')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeStep === 'skills' 
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Skills
            </button>
            <button
              onClick={() => setActiveStep('education')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeStep === 'education' 
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Education
            </button>
            <button
              onClick={() => setActiveStep('experience')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeStep === 'experience' 
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Experience
            </button>
            <button
              onClick={() => setActiveStep('appearance')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeStep === 'appearance' 
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Appearance
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {error && <Alert type="error" className="mb-6">{error}</Alert>}
          {success && <Alert type="success" className="mb-6">{success}</Alert>}
          
          {activeStep === 'basic-info' && (
            <BasicInfoSection 
              data={{
                username: formData.username,
                displayName: formData.displayName,
                title: formData.title,
                bio: formData.bio,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                website: formData.website,
                location: formData.location,
                company: formData.company,
              }}
              onChange={(data) => handleChange('basic-info', data)} 
            />
          )}
          
          {activeStep === 'social' && (
            <SocialLinksSection 
              links={formData.socialLinks}
              onChange={(links) => handleChange('socialLinks', links)} 
            />
          )}
          
          {activeStep === 'skills' && (
            <SkillsSection 
              skills={formData.skills}
              onChange={(skills) => handleChange('skills', skills)} 
            />
          )}
          
          {activeStep === 'education' && (
            <EducationSection 
              education={formData.education}
              onChange={(education) => handleChange('education', education)} 
            />
          )}
          
          {activeStep === 'experience' && (
            <ExperienceSection 
              experience={formData.experience}
              onChange={(experience) => handleChange('experience', experience)} 
            />
          )}
          
          {activeStep === 'appearance' && (
            <AppearanceSection 
              data={{
                avatarUrl: formData.avatarUrl,
                coverImageUrl: formData.coverImageUrl,
                theme: formData.theme,
                isPublic: formData.isPublic
              }}
              onChange={(data) => {
                setFormData(prev => ({
                  ...prev,
                  ...data
                }));
              }} 
            />
          )}
        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          {activeStep === 'basic-info' ? (
            <div></div>
          ) : (
            <Button variant="light" onClick={() => {
              const steps = ['basic-info', 'social', 'skills', 'education', 'experience', 'appearance'];
              const currentIndex = steps.indexOf(activeStep);
              setActiveStep(steps[currentIndex - 1]);
            }}>
              Previous
            </Button>
          )}
          
          <div className="flex gap-3">
            {activeStep !== 'appearance' ? (
              <Button variant="primary" onClick={() => {
                const steps = ['basic-info', 'social', 'skills', 'education', 'experience', 'appearance'];
                const currentIndex = steps.indexOf(activeStep);
                setActiveStep(steps[currentIndex + 1]);
              }}>
                Continue
              </Button>
            ) : (
              <Button 
                variant="primary" 
                isLoading={isSaving}
                onClick={handleSave}
              >
                {isSaving ? 'Saving...' : 'Save Name Card'}
              </Button>
            )}
            
            {existingNameCard && (
              <Button 
                variant="light" 
                onClick={() => router.push(`/${formData.username}`)}
              >
                View Card
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
