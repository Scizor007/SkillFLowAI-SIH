
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { enrollInCourse } from '@/services/api';
import { useAuth } from '@/context/auth/AuthContext';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

interface CourseEnrollDialogProps {
  course: Course;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEnrolled: boolean;
}

const CourseEnrollDialog = ({ 
  course, 
  isOpen, 
  onOpenChange,
  isEnrolled 
}: CourseEnrollDialogProps) => {
  const [enrolling, setEnrolling] = React.useState(false);
  const { user } = useAuth();
  const { fetchEnrolledCourses } = useUser();
  const navigate = useNavigate();

  const handleEnroll = async () => {
    if (!user) {
      toast.error('You must be logged in to enroll in a course');
      return;
    }
    
    try {
      setEnrolling(true);
      console.log('Enrolling user in course:', { userId: user.id, courseId: course.id });
      const success = await enrollInCourse(user.id, course.id);
      
      if (success) {
        toast.success('Successfully enrolled in the course');
        await fetchEnrolledCourses(); // Refresh enrolled courses
        onOpenChange(false);
        
        // Refresh the home page after successful enrollment
        if (window.location.pathname === '/home') {
          navigate(0); // This will refresh the current page
        } else {
          navigate('/home'); // Navigate to home if on a different page
        }
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{course.title}</DialogTitle>
          <DialogDescription className="pt-3">
            {course.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 mb-4">
          <h4 className="text-sm font-medium mb-1">Skills you'll gain:</h4>
          <div className="flex flex-wrap gap-1.5">
            {course.skillsOffered && course.skillsOffered.map((skill, index) => (
              <span 
                key={index}
                className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-secondary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between sm:flex-row gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          
          {isEnrolled ? (
            <Link to={`/course/${course.id}`}>
              <Button>
                Go to Course
              </Button>
            </Link>
          ) : (
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Enroll Now'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseEnrollDialog;
