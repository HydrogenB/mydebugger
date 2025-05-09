import React from 'react';
import { Card } from '../../design-system/components/layout';

interface Link {
  id: string;
  platform: string;
  url: string;
}

interface NameCardData {
  id: string;
  username: string;
  displayName: string | null;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  email: string | null;
  website: string | null;
  location: string | null;
  company: string | null;
  links: Link[];
  skills: string[];
  user: {
    name: string | null;
    image: string | null;
  };
}

interface NameCardViewProps {
  nameCard: NameCardData;
}

const NameCardView: React.FC<NameCardViewProps> = ({ nameCard }) => {
  const {
    displayName,
    title,
    bio,
    avatarUrl,
    phoneNumber,
    email,
    website,
    location,
    company,
    links,
    skills,
    user
  } = nameCard;

  const displayImage = avatarUrl || user.image;
  const displayFullName = displayName || user.name;

  return (
    <Card isElevated className="max-w-2xl mx-auto">
      <div className="p-6 pb-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          {displayImage && (
            <div className="mb-4 sm:mb-0 sm:mr-6">
              <img 
                src={displayImage} 
                alt={displayFullName || ''} 
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            </div>
          )}
          
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayFullName}
            </h1>
            
            {title && (
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                {title}
              </p>
            )}
            
            {company && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {company}
              </p>
            )}
            
            {location && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {location}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {bio && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm uppercase font-medium text-gray-500 dark:text-gray-400 mb-2">About</h2>
          <p className="text-gray-700 dark:text-gray-300">{bio}</p>
        </div>
      )}
      
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm uppercase font-medium text-gray-500 dark:text-gray-400 mb-2">Contact</h2>
        <div className="space-y-2">
          {email && (
            <div className="flex items-center">
              <span className="mr-2">📧</span>
              <a href={`mailto:${email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {email}
              </a>
            </div>
          )}
          
          {phoneNumber && (
            <div className="flex items-center">
              <span className="mr-2">📱</span>
              <a href={`tel:${phoneNumber}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {phoneNumber}
              </a>
            </div>
          )}
          
          {website && (
            <div className="flex items-center">
              <span className="mr-2">🌐</span>
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                {website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>
      
      {links && links.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm uppercase font-medium text-gray-500 dark:text-gray-400 mb-2">Social Links</h2>
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <a 
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {skills && skills.length > 0 && (
        <div className="px-6 py-4">
          <h2 className="text-sm uppercase font-medium text-gray-500 dark:text-gray-400 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default NameCardView;
