import React, { useState, useEffect } from 'react';
import { Button, TextInput, TextArea } from '../../../design-system/components/inputs';
import { Card } from '../../../design-system/components/layout';
import { LoadingSpinner } from '../../../design-system/components/feedback';
import { Alert } from '../../../design-system/components/feedback/Alert';

const BasicInfoSection = ({ vcard, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    title: '',
    company: '',
    bio: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    address: '',
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewProfileImage, setPreviewProfileImage] = useState('');
  const [previewCoverImage, setPreviewCoverImage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Populate form with existing data if available
  useEffect(() => {
    if (vcard) {
      setFormData({
        username: vcard.username || '',
        displayName: vcard.displayName || '',
        title: vcard.title || '',
        company: vcard.company || '',
        bio: vcard.bio || '',
        email: vcard.email || '',
        phone: vcard.phone || '',
        whatsapp: vcard.whatsapp || '',
        website: vcard.website || '',
        address: vcard.address || '',
      });
      
      if (vcard.profileImage) {
        setPreviewProfileImage(vcard.profileImage);
      }
      
      if (vcard.coverImage) {
        setPreviewCoverImage(vcard.coverImage);
      }
    }
  }, [vcard]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors when editing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors(prev => ({ 
          ...prev, 
          profileImage: 'Image too large. Maximum size is 5MB.'
        }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFieldErrors(prev => ({ 
          ...prev, 
          profileImage: 'Invalid file type. Please use JPEG, PNG, GIF or WebP.'
        }));
        return;
      }
      
      setFieldErrors(prev => ({ ...prev, profileImage: null }));
      setProfileImage(file);
      setPreviewProfileImage(URL.createObjectURL(file));
    }
  };
  
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors(prev => ({ 
          ...prev, 
          coverImage: 'Image too large. Maximum size is 5MB.'
        }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFieldErrors(prev => ({ 
          ...prev, 
          coverImage: 'Invalid file type. Please use JPEG, PNG, GIF or WebP.'
        }));
        return;
      }
      
      setFieldErrors(prev => ({ ...prev, coverImage: null }));
      setCoverImage(file);
      setPreviewCoverImage(URL.createObjectURL(file));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (!formData.username.match(/^[a-zA-Z0-9_-]{3,30}$/)) {
      errors.username = 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens';
    }
    
    // Display Name validation
    if (!formData.displayName) {
      errors.displayName = 'Display name is required';
    } else if (formData.displayName.length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    }
    
    // Email validation (if provided)
    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    // Website validation (if provided)
    if (formData.website && !isValidUrl(formData.website, true)) {
      errors.website = 'Invalid website URL';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Form validation
      if (!validateForm()) {
        throw new Error('Please correct the errors in the form');
      }
      
      // Upload images if they exist
      let profileImageUrl = previewProfileImage;
      let coverImageUrl = previewCoverImage;
      
      if (profileImage) {
        try {
          profileImageUrl = await uploadImage(profileImage);
        } catch (err) {
          throw new Error(`Failed to upload profile image: ${err.message}`);
        }
      }
      
      if (coverImage) {
        try {
          coverImageUrl = await uploadImage(coverImage);
        } catch (err) {
          throw new Error(`Failed to upload cover image: ${err.message}`);
        }
      }
      
      // Save the form data
      const success = await onSave({
        ...formData,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl,
      });
      
      if (success) {
        setProfileImage(null);
        setCoverImage(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/vcard/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }
    
    const data = await response.json();
    return data.url;
  };

  // Helper validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidUrl = (url, addProtocolIfMissing = false) => {
    if (!url) return true;
    
    // Add protocol if missing and requested
    let testUrl = url;
    if (addProtocolIfMissing && !url.match(/^https?:\/\//)) {
      testUrl = `https://${url}`;
    }
    
    try {
      new URL(testUrl);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error" className="mb-6">{error}</Alert>}
      
      <div className="space-y-6">
        {/* Profile & Cover Images */}
        <Card className="p-5">
          <h2 className="text-lg font-medium mb-4">Profile Images</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                  {previewProfileImage ? (
                    <img 
                      src={previewProfileImage} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleProfileImageChange}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label 
                    htmlFor="profile-image-upload" 
                    className="cursor-pointer inline-block px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                  >
                    Upload
                  </label>
                  {fieldErrors.profileImage && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.profileImage}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Max size: 5MB
                  </p>
                </div>
              </div>
            </div>
            
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="space-y-2">
                {previewCoverImage ? (
                  <div className="w-full h-32 rounded-md overflow-hidden bg-gray-100">
                    <img 
                      src={previewCoverImage} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 flex items-center justify-center rounded-md bg-gray-100 text-gray-400">
                    No Cover Image
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleCoverImageChange}
                    className="hidden"
                    id="cover-image-upload"
                  />
                  <label 
                    htmlFor="cover-image-upload" 
                    className="cursor-pointer inline-block px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                  >
                    Upload Cover
                  </label>
                  {fieldErrors.coverImage && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.coverImage}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Max size: 5MB. Recommended: 1200×300 pixels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Basic Info */}
        <Card className="p-5">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <TextInput
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your-username"
                required
                error={fieldErrors.username}
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be your card URL: mydebugger.vercel.app/{formData.username}
              </p>
            </div>
            
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <TextInput
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                error={fieldErrors.displayName}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <TextInput
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Software Engineer"
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <TextInput
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Acme Inc."
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <TextArea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write a short bio about yourself..."
              rows={4}
            />
            <p className="mt-1 text-xs text-gray-500">
              Tell people about yourself, your skills, and your experience.
            </p>
          </div>
        </Card>
        
        {/* Contact Info */}
        <Card className="p-5">
          <h2 className="text-lg font-medium mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <TextInput
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={fieldErrors.email}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <TextInput
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
              <p className="mt-1 text-xs text-gray-500">
                Include country code for international use
              </p>
            </div>
            
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <TextInput
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
              <p className="mt-1 text-xs text-gray-500">
                Include country code with no spaces or special characters
              </p>
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <TextInput
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                error={fieldErrors.website}
              />
              <p className="mt-1 text-xs text-gray-500">
                Include https:// for best results
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <TextInput
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, Country"
            />
          </div>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </p>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
      
      {/* Donation notice */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Creating your smart VCard requires server resources.{' '}
          <a 
            href="https://buymeacoffee.com/jiradbirdp" 
            className="text-blue-500 hover:text-blue-700 font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy me a coffee
          </a>{' '}
          to support ongoing development and hosting costs!
        </p>
      </div>
    </form>
  );
};

export default BasicInfoSection;
