import React, { useState } from 'react';
import { Card } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { useAuth } from '../auth/AuthContext';

interface Link {
  platform: string;
  url: string;
}

interface NameCardFormData {
  username: string;
  displayName: string;
  title: string;
  bio: string;
  phoneNumber: string;
  email: string;
  website: string;
  location: string;
  company: string;
  links: Link[];
  skills: string[];
}

const NameCardEditor: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<NameCardFormData>({
    username: '',
    displayName: user?.name || '',
    title: '',
    bio: '',
    phoneNumber: '',
    email: user?.email || '',
    website: '',
    location: '',
    company: '',
    links: [{ platform: '', url: '' }],
    skills: [''],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    setFormData((prev) => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, links: newLinks };
    });
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { platform: '', url: '' }],
    }));
  };

  const removeLink = (index: number) => {
    setFormData((prev) => {
      const newLinks = prev.links.filter((_, i) => i !== index);
      return { ...prev, links: newLinks };
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newSkills = [...prev.skills];
      newSkills[index] = value;
      return { ...prev, skills: newSkills };
    });
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ''],
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => {
      const newSkills = prev.skills.filter((_, i) => i !== index);
      return { ...prev, skills: newSkills };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/namecard/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Filter out empty skills
          skills: formData.skills.filter(skill => skill.trim() !== ''),
          // Filter out empty links
          links: formData.links.filter(link => link.platform.trim() !== '' && link.url.trim() !== ''),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create name card');
      }

      window.location.href = `/${formData.username}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card isElevated className="p-6 text-center">
        <p className="text-gray-700 dark:text-gray-300 mb-4">Please sign in to create your name card</p>
        <Button href="/auth/signin" variant="primary">Sign In</Button>
      </Card>
    );
  }

  return (
    <Card isElevated className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Your Name Card</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Username field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username (URL identifier) *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
              value={formData.username}
              onChange={handleChange}
              placeholder="your-username"
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be used in your name card URL: mydebugger.vercel.app/your-username
            </p>
          </div>
          
          {/* Basic details */}
          <div>
            <h2 className="text-lg font-medium mb-3">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name *
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                  value={formData.displayName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          </div>
          
          {/* Bio section */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write a short bio about yourself..."
            />
          </div>
          
          {/* Contact details */}
          <div>
            <h2 className="text-lg font-medium mb-3">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          {/* Social links */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Social Links</h2>
              <Button
                type="button"
                onClick={addLink}
                variant="light"
                size="sm"
              >
                Add Link
              </Button>
            </div>
            
            {formData.links.map((link, index) => (
              <div key={index} className="flex items-center space-x-3 mb-3">
                <div className="w-1/3">
                  <input
                    type="text"
                    placeholder="Platform"
                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                    value={link.platform}
                    onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                  />
                </div>
                <div className="flex-grow">
                  <input
                    type="url"
                    placeholder="URL"
                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeLink(index)}
                  variant="light"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          
          {/* Skills */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Skills</h2>
              <Button
                type="button"
                onClick={addSkill}
                variant="light"
                size="sm"
              >
                Add Skill
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    className="w-32 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="Skill name"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Name Card'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default NameCardEditor;
