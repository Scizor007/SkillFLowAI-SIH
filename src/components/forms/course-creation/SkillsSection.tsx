
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

const predefinedSkills = [
  'JavaScript', 'Python', 'Java', 'HTML/CSS', 'React', 
  'Node.js', 'SQL', 'Data Science', 'Machine Learning',
  'Design', 'Marketing', 'Writing', 'Project Management'
];

interface SkillsSectionProps {
  selectedSkills: string[];
  setSelectedSkills: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  selectedSkills,
  setSelectedSkills
}) => {
  const [showCustomSkill, setShowCustomSkill] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
      setShowCustomSkill(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg block mb-4">Skills This Course Offers</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {predefinedSkills.map((skill) => (
          <div 
            key={skill} 
            className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Checkbox 
              id={`skill-${skill}`}
              checked={selectedSkills.includes(skill)}
              onCheckedChange={() => toggleSkill(skill)}
            />
            <Label 
              htmlFor={`skill-${skill}`}
              className="text-sm cursor-pointer flex-1"
            >
              {skill}
            </Label>
          </div>
        ))}
        
        {selectedSkills
          .filter(skill => !predefinedSkills.includes(skill))
          .map((customSkill) => (
            <div 
              key={customSkill} 
              className="flex items-center space-x-2 p-3 border border-primary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Checkbox 
                id={`skill-${customSkill}`}
                checked={true}
                onCheckedChange={() => toggleSkill(customSkill)}
              />
              <Label 
                htmlFor={`skill-${customSkill}`}
                className="text-sm cursor-pointer flex-1"
              >
                {customSkill}
              </Label>
            </div>
          ))}
          
        {!showCustomSkill ? (
          <Button
            type="button"
            variant="outline"
            className="flex items-center justify-center p-3 border border-dashed"
            onClick={() => setShowCustomSkill(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Other Skill
          </Button>
        ) : (
          <div className="flex items-center p-3 border rounded-lg bg-muted">
            <Input
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="Type your skill"
              className="mr-2"
              autoFocus
            />
            <Button 
              type="button" 
              size="sm"
              onClick={addCustomSkill}
              disabled={!customSkill.trim()}
            >
              Add
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
