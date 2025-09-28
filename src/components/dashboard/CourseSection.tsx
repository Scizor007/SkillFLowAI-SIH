import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/ui/CourseCard';
import { Course } from '@/types';
import { Loader2, LucideIcon } from 'lucide-react';
import { User } from '@/types';

interface CourseSectionProps {
  title: string;
  icon: LucideIcon;
  courses: Course[];
  loadingCourses: boolean;
  emptyMessage: string;
  emptyActionText: string;
  emptyActionLink: string;
  user: User | null;
}

const CourseSection = ({
  title,
  icon: Icon,
  courses,
  loadingCourses,
  emptyMessage,
  emptyActionText,
  emptyActionLink,
  user
}: CourseSectionProps) => {
  const renderCourseGrid = () => {
    if (loadingCourses) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!courses || courses.length === 0) {
      return (
        <div className="bg-gray-800 shadow rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-4">
            {emptyMessage}
          </p>
          <Link to={emptyActionLink}>
            <Button>{emptyActionText}</Button>
          </Link>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <div key={course.id} style={{ animationDelay: `${idx * 80}ms` }} className="animate-pop-up">
            <CourseCard 
              course={course} 
              isCreator={course.creatorId === user?.id} 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <Icon className="mr-2 h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">
          {title}
        </h2>
      </div>
      
      {renderCourseGrid()}
    </section>
  );
};

export default CourseSection;
