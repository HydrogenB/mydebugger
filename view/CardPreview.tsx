/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { FiPhone, FiMail, FiGlobe, FiMapPin } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { getInitials } from '../model/virtualCard';

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
    <div className="relative w-full max-w-sm mx-auto border rounded-xl shadow-md bg-white p-6 text-center space-y-2">
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
            <FiPhone /> <span>{phone}</span>
          </p>
        )}
        {email && (
          <p className="flex items-center gap-2">
            <FiMail /> <span>{email}</span>
          </p>
        )}
        {website && (
          <p className="flex items-center gap-2">
            <FiGlobe /> <span>{website}</span>
          </p>
        )}
        {address && (
          <p className="flex items-center gap-2">
            <FiMapPin /> <span>{address}</span>
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
            <FiPhone />
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} aria-label="Email">
            <FiMail />
          </a>
        )}
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" aria-label="Website">
            <FiGlobe />
          </a>
        )}
        {address && (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Location"
          >
            <FiMapPin />
          </a>
        )}
      </div>
      <div className="absolute bottom-2 right-4 flex gap-4 text-xl text-gray-500">
        <a href="https://github.com" aria-label="GitHub">
          <FaGithub />
        </a>
        <a href="https://linkedin.com" aria-label="LinkedIn">
          <FaLinkedin />
        </a>
        <a href="https://facebook.com" aria-label="Facebook">
          <FaFacebook />
        </a>
      </div>
    </div>
  );
}

export default CardPreview;
