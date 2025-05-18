import React from 'react';
import { Card } from '../../../design-system/components/layout/Card';
import { Badge } from '../../../design-system/components/display';
import { SecurityScoreGauge } from './SecurityScoreGauge';
import { SecurityIssue } from '../types';

interface SecuritySummaryProps {
  issues: SecurityIssue[];
  score: number;
}

/**
 * Component to display security analysis results
 */
export const SecuritySummary: React.FC<SecuritySummaryProps> = ({
  issues,
  score
}) => {
  // Group issues by severity
  const groupedIssues = {
    high: issues.filter(issue => issue.severity === 'high'),
    medium: issues.filter(issue => issue.severity === 'medium'),
    low: issues.filter(issue => issue.severity === 'low'),
    info: issues.filter(issue => issue.severity === 'info')
  };
  
  // Get badge variant based on severity
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };
  
  return (
    <Card className="p-4 mt-4">
      <h3 className="text-lg font-medium mb-3">Security Analysis</h3>
      
      <SecurityScoreGauge score={score} />
      
      {issues.length === 0 ? (
        <div className="text-center py-4">
          <Badge variant="success" className="mb-2">All Good</Badge>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No security issues were found in this token.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedIssues).map(([severity, severityIssues]) => 
            severityIssues.length > 0 && (
              <div key={severity}>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Badge variant={getSeverityBadge(severity)} className="mr-2">
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Badge>
                  {severityIssues.length} {severityIssues.length === 1 ? 'Issue' : 'Issues'}
                </h4>
                
                <ul className="space-y-2">
                  {severityIssues.map(issue => (
                    <li key={issue.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <h5 className="text-sm font-medium mb-1">{issue.title}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{issue.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
};
