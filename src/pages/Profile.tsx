
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, Settings, BookOpen } from 'lucide-react';
import ProfileAnalytics from '@/components/profile/ProfileAnalytics';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ProfileDashboard from '@/components/profile/ProfileDashboard';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="md:w-1/4 bg-card rounded-lg shadow p-4">
              <div className="flex flex-col items-center mb-6 p-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {user?.name?.charAt(0) || '?'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
                <p className="text-muted-foreground text-sm">{user?.email || 'No email'}</p>
              </div>
              
              <nav>
                <ul className="space-y-2">
                  {sidebarItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center p-2 rounded-md text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary'
                        }`}
                      >
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            
            {/* Content */}
            <div className="md:w-3/4 bg-card rounded-lg shadow p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="dashboard">
                  <ProfileDashboard />
                </TabsContent>
                <TabsContent value="analytics">
                  <ProfileAnalytics />
                </TabsContent>
                <TabsContent value="settings">
                  <ProfileSettings />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
