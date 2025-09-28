
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SystemPromptSectionProps {
  systemPrompt: string;
  setSystemPrompt: (systemPrompt: string) => void;
}

export const SystemPromptSection: React.FC<SystemPromptSectionProps> = ({
  systemPrompt,
  setSystemPrompt
}) => {
  return (
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
  );
};
