
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAdmin } from '@/context/AdminContext';
import { User, Course } from '@/types';
import { Loader2, ShieldAlert, Users, Bookmark, LogOut } from 'lucide-react';
import UserAdminTable from '@/components/admin/UserAdminTable';
import CourseAdminTable from '@/components/admin/CourseAdminTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdminMode, deactivateAdminMode, getAllUsers, getAllCourses } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('users');

  useEffect(() => {
    if (!isAdminMode) {
      navigate('/profile');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [usersData, coursesData] = await Promise.all([
          getAllUsers(),
          getAllCourses()
        ]);
        
        setUsers(usersData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdminMode, navigate, getAllUsers, getAllCourses]);

  const handleRefresh = async () => {
    setLoading(true);
    
    try {
      if (activeTab === 'users') {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } else {
        const coursesData = await getAllCourses();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    deactivateAdminMode();
    navigate('/profile');
  };

  if (!isAdminMode) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-6 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleExit}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit Admin Mode
            </Button>
          </div>
        </div>
        
        <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You're in admin mode with full system access. Changes here affect all users.
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Courses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="border rounded-lg p-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <UserAdminTable users={users} onRefresh={handleRefresh} />
            )}
          </TabsContent>
          
          <TabsContent value="courses" className="border rounded-lg p-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <CourseAdminTable courses={courses} onRefresh={handleRefresh} />
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
