import React from 'react';
import { Button } from '../../../design-system/components/inputs';

interface Skill {
  name: string;
  proficiency?: number;
  displayOrder?: number;
}

interface SkillsSectionProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export default function SkillsSection({ skills, onChange }: SkillsSectionProps) {
  const addSkill = () => {
    onChange([...skills, { name: '' }]);
  };

  const removeSkill = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    onChange(newSkills);
  };

  const updateSkill = (index: number, field: 'name' | 'proficiency', value: string | number) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    onChange(newSkills);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Skills & Expertise</h2>
        <Button 
          variant="light" 
          size="sm"
          onClick={addSkill}
        >
          Add Skill
        </Button>
      </div>
      
      {skills.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No skills added yet. Click "Add Skill" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill(index, 'name', e.target.value)}
                  placeholder="Skill Name"
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                />
              </div>
              
              <div className="w-1/3">
                <label className="flex items-center">
                  <span className="mr-2 text-sm text-gray-500">Proficiency:</span>
                  <input
                    type="range"
                    value={skill.proficiency || 0}
                    onChange={(e) => updateSkill(index, 'proficiency', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full rounded-md"
                  />
                  <span className="ml-2 text-sm w-10 text-center">{skill.proficiency || 0}%</span>
                </label>
              </div>
              
              <Button
                variant="light"
                size="sm"
                onClick={() => removeSkill(index)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-md font-medium mb-2">Tips</h3>
        <ul className="list-disc text-sm text-gray-600 dark:text-gray-400 pl-5">
          <li>Add your technical, professional, and soft skills.</li>
          <li>Use the proficiency slider to indicate your level of expertise.</li>
          <li>Order your skills by dragging them into your preferred arrangement.</li>
        </ul>
      </div>
    </div>
  );
}
