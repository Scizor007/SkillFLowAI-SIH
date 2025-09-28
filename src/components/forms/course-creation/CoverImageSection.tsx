
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CoverImageSectionProps {
  coverImage: string;
  setCoverImage: (coverImage: string) => void;
}

export const CoverImageSection: React.FC<CoverImageSectionProps> = ({
  coverImage,
  setCoverImage
}) => {
  return (
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
  );
};
