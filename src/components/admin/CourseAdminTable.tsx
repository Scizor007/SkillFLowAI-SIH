
import React, { useState } from 'react';
import { Course } from '@/types';
import { useAdmin } from '@/context/AdminContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Eye, Pencil, Trash, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface CourseAdminTableProps {
  courses: Course[];
  onRefresh: () => Promise<void>;
}

const CourseAdminTable: React.FC<CourseAdminTableProps> = ({ courses, onRefresh }) => {
  const { deleteCourse } = useAdmin();
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  const handleDeleteCourse = async (courseId: string) => {
    setLoadingCourseId(courseId);
    try {
      await deleteCourse(courseId);
      await onRefresh();
    } finally {
      setLoadingCourseId(null);
    }
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                //table adds key to each row
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {course.skillsOffered.slice(0, 3).map((skill, index) => (
                        <Badge variant="outline" key={index}>{skill}</Badge>
                      ))}
                      {course.skillsOffered.length > 3 && (
                        <Badge variant="outline">+{course.skillsOffered.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{course.creatorName}</TableCell>
                  <TableCell>{course.viewCount}</TableCell>
                  <TableCell>
                    {course.createdAt ? formatDistanceToNow(new Date(course.createdAt), { addSuffix: true }) : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right">
                    {loadingCourseId === course.id ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/course/${course.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{course.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCourse(course.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseAdminTable;
