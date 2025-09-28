
import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CourseDetail from './pages/CourseDetail';
import CourseQuiz from './pages/CourseQuiz';
import NotFound from './pages/NotFound';
import CreateCourse from './pages/CreateCourse';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import JobSearch from './pages/JobSearch';
import Index from './pages/Index';
import LeaderBoard from './pages/LeaderBoard';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useAdmin } from './context/AdminContext';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import ParentsCounseling from './pages/ParentsCounseling';
import CollegeFinder from './pages/CollegeFinder';
import CourseToCareer from './pages/CourseToCareer';

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin route component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdminMode } = useAdmin();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdminMode) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path:'/about',
    element: <AboutUs/>
  },
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/course/:courseId',
    element: <CourseDetail />,
  },
  {
    path: '/course/:courseId/quiz',
    element: <CourseQuiz />,
  },
  {
    path: '/create-course',
    element: <ProtectedRoute><CreateCourse /></ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: '/admin',
    element: <AdminRoute><Admin /></AdminRoute>,
  },
  {
    path: '/onboarding',
    element: <ProtectedRoute><Onboarding /></ProtectedRoute>,
  },
  {
    path: '/jobs',
    element: <JobSearch />,
  },
  {
    path:'/Leaderboard',
    element: <LeaderBoard/>
  },
  {
    path: '/FAQ',
    element: <FAQ/>
  },
  {
    path: '/counseling/parents',
    element: <ParentsCounseling />
  },
  {
    path: '*',
    element: <NotFound />,
  },
  {
    path: '/college-finder',
    element: <CollegeFinder />
  },
  {
  path: '/course-to-career',
  element: <CourseToCareer />,
}
]);
