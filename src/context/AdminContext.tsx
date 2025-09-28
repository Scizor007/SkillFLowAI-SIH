import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminState, User, Course } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType extends AdminState {
  activateAdminMode: (password: string) => boolean;
  deactivateAdminMode: () => void;
  getAllUsers: () => Promise<User[]>;
  getAllCourses: () => Promise<Course[]>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  toggleUserAdmin: (userId: string, isAdmin: boolean) => Promise<boolean>;
  banUser: (userId: string) => Promise<boolean>;
}

const ADMIN_PASSWORD = "admin137ayu";

const AdminContext = createContext<AdminContextType>({
  isAdminMode: false,
  adminPassword: '',
  activateAdminMode: () => false,
  deactivateAdminMode: () => {},
  getAllUsers: async () => [],
  getAllCourses: async () => [],
  deleteCourse: async () => false,
  toggleUserAdmin: async () => false,
  banUser: async () => false,
});

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminState, setAdminState] = useState<AdminState>({
    isAdminMode: false,
    adminPassword: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const storedAdminMode = localStorage.getItem(`admin_mode_${user.id}`);
      if (storedAdminMode === 'true') {
        setAdminState({
          isAdminMode: true,
          adminPassword: ADMIN_PASSWORD,
        });
      }
    }
  }, [user]);

  const activateAdminMode = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setAdminState({
        isAdminMode: true,
        adminPassword: password,
      });
      if (user) {
        localStorage.setItem(`admin_mode_${user.id}`, 'true');
      }
      toast.success('Admin mode activated');
      return true;
    } else {
      toast.error('Invalid admin password');
      return false;
    }
  };

  const deactivateAdminMode = (): void => {
    setAdminState({
      isAdminMode: false,
      adminPassword: '',
    });
    if (user) {
      localStorage.removeItem(`admin_mode_${user.id}`);
    }
    toast.info('Admin mode deactivated');
  };

  const getAllUsers = async (): Promise<User[]> => {
    if (!adminState.isAdminMode) {
      toast.error('Admin access required');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      return data.map((profile: any) => ({
        id: profile.id,
        name: profile.full_name || '',
        email: profile.email || '',
        skills: profile.skills || [],
        visualPoints: profile.visual_points || 0,
        textualPoints: profile.textual_points || 0,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        isAdmin: profile.is_admin || false,
        isBanned: profile.is_banned || false
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      return [];
    }
  };

  const getAllCourses = async (): Promise<Course[]> => {
    if (!adminState.isAdminMode) {
      toast.error('Admin access required');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('Courses_Table')
        .select('*');

      if (error) throw error;

      return data.map((course: any) => ({
        id: String(course.id),
        title: course.c_name || 'Untitled Course',
        description: course.description || '',
        coverImage: course.cover_image || '/placeholder.svg',
        creatorId: String(course.creator_id || ''),
        creatorName: course.creator_name || 'Unknown',
        skillsOffered: Array.isArray(course.skill_offered) 
          ? course.skill_offered.map((skill: any) => String(skill))
          : [],
        viewCount: course.enrolled_count || 0,
        createdAt: course.created_at || new Date().toISOString(),
        updatedAt: course.updated_at || new Date().toISOString(),
        systemPrompt: course.content_prompt || ''
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
      return [];
    }
  };

  const deleteCourse = async (courseId: string): Promise<boolean> => {
    if (!adminState.isAdminMode) {
      toast.error('Admin access required');
      return false;
    }

    try {
      const numericId = Number(courseId);
      
      const { error } = await supabase
        .from('Courses_Table')
        .delete()
        .eq('id', numericId);

      if (error) throw error;

      toast.success('Course deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
      return false;
    }
  };

  const toggleUserAdmin = async (userId: string, isAdmin: boolean): Promise<boolean> => {
    if (!adminState.isAdminMode) {
      toast.error('Admin access required');
      return false;
    }

    try {
      const { error } = await supabase.rpc('update_profile_admin_status', {
        user_id: userId,
        admin_status: isAdmin
      } as { user_id: string; admin_status: boolean });

      if (error) throw error;

      toast.success(`User ${isAdmin ? 'promoted to admin' : 'demoted from admin'}`);
      return true;
    } catch (error) {
      console.error('Error updating user admin status:', error);
      toast.error('Failed to update user');
      return false;
    }
  };

  const banUser = async (userId: string): Promise<boolean> => {
    if (!adminState.isAdminMode) {
      toast.error('Admin access required');
      return false;
    }

    try {
      const { error } = await supabase.rpc('update_profile_ban_status', {
        user_id: userId,
        ban_status: true
      } as { user_id: string; ban_status: boolean });

      if (error) throw error;

      toast.success('User banned successfully');
      return true;
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
      return false;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        ...adminState,
        activateAdminMode,
        deactivateAdminMode,
        getAllUsers,
        getAllCourses,
        deleteCourse,
        toggleUserAdmin,
        banUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
