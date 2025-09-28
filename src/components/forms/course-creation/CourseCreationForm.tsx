
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createCourseInDB } from '@/services/courseService';
import { TitleDescriptionSection } from './TitleDescriptionSection';
import { CoverImageSection } from './CoverImageSection';
import { SystemPromptSection } from './SystemPromptSection';
import { SkillsSection } from './SkillsSection';
import { useModuleGenerator } from './hooks/useModuleGenerator';

const CourseCreationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { generateModules, creatingStatus } = useModuleGenerator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !systemPrompt || selectedSkills.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (systemPrompt.length < 50) {
      toast.error('System prompt should be at least 50 characters');
      return;
    }
    
    if (!user) {
      toast.error('You need to be logged in to create a course');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Generate modules using Gemini API
      const courseModules = await generateModules(title, systemPrompt);
      
      const courseData = {
        title,
        description,
        coverImage: coverImage || 'https://placehold.co/1200x630/3b82f6/ffffff.jpg?text=Course',
        skillsOffered: selectedSkills,
        systemPrompt,
        creatorId: user.id,
        creatorName: user.name || 'Unknown Creator',
        courseModules
      };
      
      const newCourse = await createCourseInDB({
        ...courseData,
        courseModules
      });
      
      if (!newCourse) {
        toast.error('Failed to create course');
        return;
      }
      
      toast.success('Course created successfully!');
      navigate(`/course/${newCourse.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TitleDescriptionSection 
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
      />
      
      <CoverImageSection 
        coverImage={coverImage}
        setCoverImage={setCoverImage}
      />
      
      <SystemPromptSection 
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
      />
      
      <SkillsSection 
        selectedSkills={selectedSkills}
        setSelectedSkills={setSelectedSkills}
      />
      
      <Button 
        type="submit" 
        className="w-full py-6 text-base font-medium mt-8"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {creatingStatus || 'Creating Course...'}
            </div>
            {creatingStatus === 'Generating course modules with AI...' && 
              <p className="text-xs opacity-80">This might take a moment as we're using AI to generate quality modules</p>
            }
          </div>
        ) : (
          'Create Course'
        )}
      </Button>
    </form>
  );
};

export default CourseCreationForm;
