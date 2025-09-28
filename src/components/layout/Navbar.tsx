import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/context/auth/AuthContext'; // Updated to correct path
import { Menu, X, ChevronDown, LogOut, User, BookOpen, BarChart, Briefcase, Info, HelpCircle, HeartHandshake, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const navLinks = [
    { name: 'Home', href: isAuthenticated ? '/home' : '/' },
    { name: 'Courses', href: '/home' },
    { name: 'About Us', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'College Finder', href: '/college-finder' },
    ...(isAuthenticated
      ? [
          { name: 'Job Search', href: '/jobs' },
          { name: 'Leaderboard', href: '/leaderboard' },
          { name: 'Course to Career', href: '/course-to-career' }, // Fixed path
        ]
      : []),
  ];

  return (
    <header className="bg-background border-b border-border z-40 fixed w-full top-0">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">SkillFlowAI</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span className="hidden sm:inline-block">
                    {user?.name || 'Account'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/home')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>My Courses</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/course-to-career')}>
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Course to Career</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/create-course')}>
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Create Course</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/jobs')}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Job Search</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/about')}>
                  <Info className="mr-2 h-4 w-4" />
                  <span>About Us</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/faq')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>FAQ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/counseling/parents')}>
                  <HeartHandshake className="mr-2 h-4 w-4" />
                  <span>Parents Counseling</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/college-finder')}>
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>College Finder</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup" className="hidden sm:block">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-background border-t">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground/80 hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  to="/counseling/parents"
                  className="text-foreground/80 hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Parents Counseling
                </Link>
                <Link
                  to="/college-finder"
                  className="text-foreground/80 hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  College Finder
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/signup" className="sm:hidden">
                <Button className="w-full">Sign up</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;