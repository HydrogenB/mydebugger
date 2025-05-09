import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { useSession } from 'next-auth/react';
import {
  TextInput,
  TextareaInput,
  Button,
  SelectInput,
  Card,
  Alert,
  LoadingSpinner,
  TabGroup, Tab, TabPanel // Assuming these are from @design-system
} from '@design-system'; // Assuming components are from the main design system entry

import BasicInfoSection from './editor/BasicInfoSection';
import SocialLinksSection from './editor/SocialLinksSection';
// import EducationSection from './editor/EducationSection'; // Assuming EducationSection.tsx exists or create it
// import ExperienceSection from './editor/ExperienceSection'; // Assuming ExperienceSection.tsx exists or create it
// import AppearanceSection from './editor/AppearanceSection'; // Assuming AppearanceSection.tsx exists or create it
import SkillsSection from './editor/SkillsSection';
import PortfolioSection from './editor/PortfolioSection';
import NameCardPreview from './preview/NameCardPreview';
import { NameCardFormData, SocialLink, Education, Experience, Skill, PortfolioItem } from '../../types/namecard';

// Placeholders if actual files are missing
const EducationSection: React.FC<any> = (props) => <div {...props}>Education Section Placeholder</div>;
const ExperienceSection: React.FC<any> = (props) => <div {...props}>Experience Section Placeholder</div>;
const AppearanceSection: React.FC<any> = (props) => <div {...props}>Appearance Section Placeholder</div>;


interface NameCardEditorProps {
  initialData?: NameCardFormData | null;
  onSave: (data: NameCardFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  setError?: (error: string | null) => void;
}

const NameCardEditor: React.FC<NameCardEditorProps> = ({
  initialData,
  onSave,
  loading: externalLoading = false,
  error: externalError,
  setError: setExternalError
}) => {
  // const router = useRouter();
  // const { data: session, status } = useSession();
  const [formData, setFormData] = useState<NameCardFormData>(
    initialData || {
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
    }
  );
  const [activeStep, setActiveStep] = useState('basic-info');
  const [isLoading, setIsLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const currentError = externalError !== undefined ? externalError : internalError;
  const setError = setExternalError !== undefined ? setExternalError : setInternalError;

  const handleChange = (section: keyof NameCardFormData, updatedData: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: updatedData
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await onSave(formData);
      // Optionally, redirect or show success message
    } catch (err: any) { // Typed err
      if (err instanceof Error) {
        setError(err.message || 'Failed to save name card');
      } else {
        setError(String(err) || 'Failed to save name card');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card isElevated className="mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold">
            {initialData ? 'Edit Your Name Card' : 'Create Your Name Card'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a beautiful digital name card to share your professional identity.
          </p>
        </div>
        
        <TabGroup>
          <Tab id="basic-info">Basic Info</Tab>
          <Tab id="social-links">Social Links</Tab>
          <Tab id="skills">Skills</Tab>
          <Tab id="education">Education</Tab>
          <Tab id="experience">Experience</Tab>
          <Tab id="appearance">Appearance</Tab>
          
          <TabPanel id="basic-info">
            <BasicInfoSection
              data={formData.basicInfo}
              onChange={(data) => handleChange('basic-info' as keyof NameCardFormData, data)} // Cast 'basic-info'
            />
          </TabPanel>
          <TabPanel id="social-links">
            <SocialLinksSection 
              links={formData.socialLinks}
              onChange={(links) => handleChange('socialLinks', links)} 
            />
          </TabPanel>
          <TabPanel id="skills">
            <SkillsSection 
              skills={formData.skills}
              onChange={(skills) => handleChange('skills', skills)} 
            />
          </TabPanel>
          <TabPanel id="education">
            <EducationSection
              // @ts-ignore TODO: Define proper props for EducationSection if it exists
              items={formData.education || []}
              onChange={(education: any) => handleChange('education', education)} // Typed education
            />
          </TabPanel>
          <TabPanel id="experience">
            <ExperienceSection
              // @ts-ignore TODO: Define proper props for ExperienceSection if it exists
              items={formData.experience || []}
              onChange={(experience: any) => handleChange('experience', experience)} // Typed experience
            />
          </TabPanel>
          <TabPanel id="appearance">
            <AppearanceSection
              // @ts-ignore TODO: Define proper props for AppearanceSection if it exists
              settings={formData.appearance || { themeColor: '#000000', layout: 'classic' }}
              onChange={(data: any) => { // Typed data
                handleChange('appearance', data);
              }}
            />
          </TabPanel>
        </TabGroup>
        
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
                isLoading={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Saving...' : 'Save Name Card'}
              </Button>
            )}
            
            {initialData && (
              <Button 
                variant="light" 
                onClick={() => console.log(`View Card for ${formData.username}`)}
              >
                View Card
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NameCardEditor;
