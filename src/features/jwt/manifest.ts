import { lazy } from 'react';
import { ToolCategory } from '../../types/tools';
// You'll need to create or import this icon
import JwtIcon from '../../shared/components/icons/JwtIcon';

const manifest = {
  id: 'jwt-toolkit',
  route: '/jwt',
  title: 'JWT Toolkit',
  description: 'Decode, verify, and create JSON Web Tokens',
  icon: JwtIcon,
  component: lazy(() => import('./components/JwtToolkit')),
  category: 'Security' as ToolCategory,
  isPopular: true,
  metadata: {
    keywords: ['jwt', 'json web token', 'decoder', 'encoder', 'verify', 'sign'],
    learnMoreUrl: 'https://jwt.io/introduction',
    relatedTools: ['url-encoder', 'headers-analyzer'],
  },
  uiOptions: {
    showExamples: true
  }
};

export default manifest;
