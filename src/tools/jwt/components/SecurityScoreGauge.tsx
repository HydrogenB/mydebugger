import React from 'react';
import { Text } from '../../../design-system/components/typography';

interface SecurityScoreGaugeProps {
  score: number;
}

// Helper functions for security score display
const getSecurityScoreText = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Poor';
  return 'Critical';
};

const getSecurityScoreColor = (score: number): string => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 80) return 'bg-green-400';
  if (score >= 60) return 'bg-yellow-400';
  if (score >= 40) return 'bg-orange-400';
  return 'bg-red-500';
};

const getBadgeColor = (score: number): string => {
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 80) return 'bg-green-50 text-green-600';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  if (score >= 40) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export const SecurityScoreGauge: React.FC<SecurityScoreGaugeProps> = ({ score }) => {
  const scoreText = getSecurityScoreText(score);
  const filledWidth = `${Math.max(0, Math.min(100, score))}%`;
  const gaugeColor = getSecurityScoreColor(score);
  const badgeColor = getBadgeColor(score);
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <Text variant="bodySmall" className="font-semibold">
          Security Score
        </Text>
        <div className={`px-2 py-1 rounded-md ${badgeColor}`}>
          {score}/100 - {scoreText}
        </div>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${gaugeColor} rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: filledWidth }}
        ></div>
      </div>
      <div className="mt-2">
        <Text variant="caption" className="text-gray-500">
          {score >= 80 ? 
            "This token follows security best practices." : 
            score >= 60 ? 
            "This token has some security concerns that should be addressed." :
            "This token has significant security issues that require immediate attention."}
        </Text>
      </div>
    </div>
  );
};

export default SecurityScoreGauge;