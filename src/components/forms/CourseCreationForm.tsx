
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { createCourseInDB } from '@/services/courseService';
import { supabase } from '@/integrations/supabase/client';

const predefinedSkills = [
  'JavaScript', 'Python', 'Java', 'HTML/CSS', 'React', 
  'Node.js', 'SQL', 'Data Science', 'Machine Learning',
  'Design', 'Marketing', 'Writing', 'Project Management'
];

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

const CourseCreationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomSkill, setShowCustomSkill] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [creatingStatus, setCreatingStatus] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
      setShowCustomSkill(false);
    }
  };

  const generateModules = async () => {
    try {
      setCreatingStatus('Generating course modules with AI...');
      
      const prompt = `You are an AI Instructor. You have to create study material on the following topic: ${title}. 
      
      Additional details: ${systemPrompt}
      
      Create a JSON array containing exactly 10 modules. Each module should have title and description fields. 
      The modules should align with the course and provide all the main headings that are to be covered.
      
      Return ONLY a valid JSON array without any additional text or explanation. The format should be:
      [
        {"title": "Module 1 Name", "description": "Module 1 description..."},
        {"title": "Module 2 Name", "description": "Module 2 description..."},
        ...
      ]`;
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract JSON content from Gemini response
      let moduleText = '';
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        moduleText = data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Unexpected response format from Gemini API");
      }
      
      // Extract JSON from possible text response (handling potential markdown code blocks)
      const jsonMatch = moduleText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Could not find JSON array in response");
      }
      
      const modulesJson = JSON.parse(jsonMatch[0]);
      console.log("Generated modules:", modulesJson);
      
      return modulesJson;
    } catch (error) {
      console.error('Error in generateModules:', error);
      toast.error('Failed to generate course modules');
      throw error;
    }
  };

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
      setCreatingStatus('Starting course creation...');
      
      // Generate modules using Gemini API
      const courseModules = await generateModules();
      setCreatingStatus('Creating course in database...');
      
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
      setCreatingStatus('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="title" className="text-lg">Course Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Complete Python Masterclass"
          className="w-full p-3"
          required
        />
      </div>
      
      <div className="space-y-4">
        <Label htmlFor="description" className="text-lg">Course Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what students will learn in this course"
          className="w-full p-3 min-h-[100px]"
          required
        />
      </div>
      
      <div className="space-y-4">
        <Label htmlFor="coverImage" className="text-lg">Cover Image URL</Label>
        <Input
          id="coverImage"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://example.com/your-image.jpg"
          className="w-full p-3"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Leave blank to use a default image.
        </p>
      </div>
      
      <div className="space-y-4">
        <Label htmlFor="systemPrompt" className="text-lg">Course Content Prompt (100+ chars)</Label>
        <Textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Provide a detailed description of what this course should teach. This will be used to generate the course content."
          className="w-full p-3 min-h-[200px]"
          required
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This prompt will guide our AI in generating your course content. Be specific about topics, concepts, and learning objectives.
        </p>
      </div>
      
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
