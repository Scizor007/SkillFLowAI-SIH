
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Users } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  description: string;
  skillsOffered: string[];
  coverImage: string;
  viewCount: number;
}

const CourseHeader = ({
  title,
  description,
  skillsOffered,
  coverImage,
  viewCount
}: CourseHeaderProps) => {
  return (
    <div className="mb-12">
      <div className="flex items-center mb-4">
        <Link to="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold ml-4">{title}</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:shrink-0">
            <img 
              className="h-48 w-full object-cover md:h-full md:w-48" 
              src={coverImage} 
              alt={title}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-primary font-semibold">
              {skillsOffered.join(' • ')}
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {description}
            </p>
            <div className="mt-4 flex items-center">
              <Users className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {viewCount || 0} learners
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
