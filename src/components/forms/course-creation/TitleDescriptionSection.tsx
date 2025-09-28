
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TitleDescriptionSectionProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

export const TitleDescriptionSection: React.FC<TitleDescriptionSectionProps> = ({
  title,
  setTitle,
  description,
  setDescription
}) => {
  return (
    <>
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
    </>
  );
};
