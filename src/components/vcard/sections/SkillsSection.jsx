import React, { useState, useEffect } from 'react';
import { Button, TextInput } from '../../../design-system/components/inputs';
import { Card } from '../../../design-system/components/layout';
import { LoadingSpinner } from '../../../design-system/components/feedback';
import { Alert } from '../../../design-system/components/feedback/Alert';

const SkillsSection = ({ vcard, onSave }) => {
  const [skills, setSkills] = useState([{ name: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load existing skills
  useEffect(() => {
    if (vcard?.skills?.length) {
      setSkills(vcard.skills.map(skill => ({
        id: skill.id,
        name: skill.name
      })));
    }
  }, [vcard]);
  
  const handleAddSkill = () => {
    setSkills([...skills, { name: '' }]);
  };
  
  const handleRemoveSkill = (index) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setSkills(newSkills);
  };
  
  const handleSkillChange = (index, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = { ...updatedSkills[index], name: value };
    setSkills(updatedSkills);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Filter out empty skills
      const filteredSkills = skills.filter(skill => skill.name.trim());
      
      // Save changes
      await onSave({ skills: filteredSkills });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error" className="mb-6">{error}</Alert>}
      
      <Card className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-medium">Professional Skills</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddSkill}
          >
            Add Skill
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add your professional skills to showcase your expertise.
        </p>
        
        {skills.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No skills added. Click "Add Skill" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <TextInput
                    value={skill.name}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="e.g., Project Management, JavaScript, UI Design"
                  />
                </div>
                
                <Button
                  type="button"
                  variant="light"
                  size="sm"
                  onClick={() => handleRemoveSkill(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm text-gray-600 dark:text-gray-300">
          <h3 className="font-medium mb-2">Tips:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Add both technical skills and soft skills</li>
            <li>Be specific about your expertise (e.g., "React.js" instead of just "JavaScript")</li>
            <li>Include certifications and tools you're proficient with</li>
          </ul>
        </div>
      </Card>
      
      <div className="mt-6 flex justify-end">
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
    </form>
  );
};

export default SkillsSection;
