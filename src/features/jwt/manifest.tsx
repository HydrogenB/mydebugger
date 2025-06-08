import React from 'react';
import { lazy } from 'react';
import { Tool, ToolCategory } from '../../tools'; // Corrected path for ToolCategory
import { ShieldCheckIcon } from '@heroicons/react/24/outline'; // Placeholder Icon

// Placeholder if JwtIcon is missing
const JwtIcon = ShieldCheckIcon;

const jwtTool: Tool = {
  id: 'jwt-toolkit',
  title: 'JWT Toolkit',
  description: 'Decode, verify, and build JSON Web Tokens.',
  icon: JwtIcon,
  category: 'Security' as ToolCategory, // Cast if ToolCategory is a string literal union
  route: '/jwt',  component: lazy(() =>
    import('../../tools/jwt/JwtToolkit').catch(() => ({
      default: () => (<div>JWT Toolkit Component Not Found</div>),
    }))
  ),
  metadata: {
    keywords: ['jwt', 'json web token', 'decode', 'verify', 'security'],
    learnMoreUrl: 'https://jwt.io/',
  },
};

export default jwtTool;
