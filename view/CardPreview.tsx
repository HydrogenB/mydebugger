/**
 * © 2025 MyDebugger Contributors – MIT License
 */
// @ts-nocheck
import * as React from 'react';
import { FiPhone, FiMail, FiGlobe, FiMapPin } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaFacebook } from 'react-icons/fa';

// Import icons with type assertion
const Icons = {
  Phone: (props: any) => <FiPhone {...props} />,
  Mail: (props: any) => <FiMail {...props} />,
  Globe: (props: any) => <FiGlobe {...props} />,
  MapPin: (props: any) => <FiMapPin {...props} />,
  Github: (props: any) => <FaGithub {...props} />,
  Linkedin: (props: any) => <FaLinkedin {...props} />,
  Facebook: (props: any) => <FaFacebook {...props} />
} as const;

// Import icons dynamically to avoid type issues
const { Phone, Mail, Globe, MapPin, Github, Linkedin, Facebook } = Icons;

// Import utility functions
const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

interface CardPreviewProps {
  fullName: string;
  title: string;
  organization: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  download: () => void;
}

function CardPreview({
  fullName,
  title,
  organization,
  phone,
  email,
  website,
  address,
  download,
}: CardPreviewProps) {
  return (
    <div className="relative w-full max-w-sm mx-auto border rounded-xl shadow-md bg-white p-6 pb-16 text-center space-y-2">
      <div className="bg-black text-white text-sm font-semibold py-1 rounded">
        {organization || fullName || 'KOKTAIL'}
      </div>
      <div className="flex flex-col items-center space-y-1">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700">
          {getInitials(fullName) || '?'}
        </div>
        <h2 className="text-lg font-bold text-gray-800">{fullName || 'Your Name'}</h2>
        {title && <p className="text-sm italic text-gray-600">{title}</p>}
        {organization && <p className="text-sm text-gray-500">{organization}</p>}
      </div>
      <hr className="my-2" />
      <div className="text-sm text-gray-600 space-y-1 text-left">
        {phone && (
          <p className="flex items-center gap-2">
            <Phone size={16} /> <span>{phone}</span>
          </p>
        )}
        {email && (
          <p className="flex items-center gap-2">
            <Mail size={16} /> <span>{email}</span>
          </p>
        )}
        {website && (
          <p className="flex items-center gap-2">
            <Globe size={16} /> <span>{website}</span>
          </p>
        )}
        {address && (
          <p className="flex items-center gap-2">
            <MapPin size={16} /> <span>{address}</span>
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={download}
        className="mt-3 px-4 py-2 rounded-full bg-red-600 text-white w-full max-w-xs"
      >
        Save Contact
      </button>
      <div className="flex justify-center gap-3 pt-4 text-red-600 text-xl">
        {phone && (
          <a href={`tel:${phone}`} aria-label="Call">
            <Phone size={20} />
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} aria-label="Email">
            <Mail size={20} />
          </a>
        )}
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" aria-label="Website">
            <Globe size={20} />
          </a>
        )}
        {address && (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Location"
          >
            <MapPin size={20} />
          </a>
        )}
      </div>
      <div className="absolute bottom-4 right-4 flex gap-4 text-xl text-gray-500">
        <a href="https://github.com" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
          <Github size={20} />
        </a>
        <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
          <Linkedin size={20} />
        </a>
        <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
          <Facebook size={20} />
        </a>
      </div>
    </div>
  );
}

export default CardPreview;
