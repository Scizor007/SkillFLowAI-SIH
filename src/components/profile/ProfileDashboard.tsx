import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Loader2, BookOpen, LineChart, PieChart, TrendingUp, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseCard from '@/components/ui/CourseCard';
import { useDashboardCourses } from '@/hooks/useDashboardCourses';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface UserStats {
  visualPoints: number;
  textualPoints: number;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  avgCompletionRate: number;
  recentActivity: ActivityItem[];
  skillBreakdown: SkillItem[];
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  moduleId?: string;
  courseId?: string;
}

interface SkillItem {
  name: string;
  score: number;
  color: string;
}

const ProfileDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { loadingCourses, enrolledCourses } = useDashboardCourses(user, isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    visualPoints: 0,
    textualPoints: 0,
    totalCoursesEnrolled: 0,
    totalCoursesCompleted: 0,
    avgCompletionRate: 0,
    recentActivity: [],
    skillBreakdown: []
  });

  // Sample colors for the skill breakdown chart
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile with learning points
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('visual_points, textual_points')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }
        
        // Fetch course completion data
        const { data: completionData, error: completionError } = await supabase
          .from('user_course_progress')
          .select('course_id, completion_percentage')
          .eq('user_id', user.id);
          
        if (completionError) {
          console.error('Error fetching course progress:', completionError);
        }
        
        // Create mock recent activity data based on enrolled courses
        const mockActivityData: ActivityItem[] = enrolledCourses.slice(0, 5).map((course, index) => ({
          id: `activity-${course.id}-${index}`,
          type: 'Course Enrollment',
          title: `Enrolled in ${course.title}`,
          timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
          courseId: course.id
        }));

        // Fetch skills data - using enrolledCourses as a fallback for skills
        const skillsData = enrolledCourses.flatMap(course => 
          course.skillsOffered.map(skill => skill.trim()) || []
        );
        
        // Count occurrences of each skill
        const skillCounts = skillsData.reduce((acc: Record<string, number>, skill: string) => {
          acc[skill] = (acc[skill] || 0) + 1;
          return acc;
        }, {});
        
        // Transform skills data for the chart
        const skillBreakdown = Object.entries(skillCounts).map(([name, score], index) => ({
          name,
          score,
          color: colors[index % colors.length]
        }));

        // Calculate average completion rate
        const completionRates = completionData?.map(item => item.completion_percentage) || [];
        const avgCompletionRate = completionRates.length 
          ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
          : 0;

        // Update state with all fetched data
        setUserStats({
          visualPoints: profileData?.visual_points || 0,
          textualPoints: profileData?.textual_points || 0,
          totalCoursesEnrolled: enrolledCourses.length,
          totalCoursesCompleted: completionRates.filter(rate => rate >= 100).length,
          avgCompletionRate,
          recentActivity: activityData || [],
          skillBreakdown
        });

      } catch (err) {
        console.error('Error fetching user stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && !loadingCourses) {
      fetchUserData();
    }
  }, [user, isAuthenticated, loadingCourses, enrolledCourses]);

  if (loading || loadingCourses) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate learning style preference
  const totalPoints = userStats.visualPoints + userStats.textualPoints;
  const visualPercentage = totalPoints > 0 ? (userStats.visualPoints / totalPoints) * 100 : 50;
  const textualPercentage = totalPoints > 0 ? (userStats.textualPoints / totalPoints) * 100 : 50;
  
  // Learning style data for visualization
  const learningStyleData = [
    { name: 'Visual', value: userStats.visualPoints },
    { name: 'Textual', value: userStats.textualPoints }
  ];

  // Get dominant learning style
  const dominantStyle = userStats.visualPoints > userStats.textualPoints ? 'visual' : 'textual';

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500 mb-2">
          Welcome back, {user?.user_metadata?.name || 'Learner'}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your learning dashboard shows your progress and personalized insights.
        </p>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Learning Style Card */}
            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Learning Style Preference</CardTitle>
                <CardDescription>How you best understand content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={learningStyleData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={60} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {learningStyleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-sm">
                  <p>Based on your learning behavior, you prefer <span className="font-medium text-primary">{dominantStyle}</span> content.</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Course Progress Card */}
            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Course Progress</CardTitle>
                <CardDescription>Your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Average Completion</p>
                      <p className="text-2xl font-bold">{Math.round(userStats.avgCompletionRate)}%</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <p>Progress</p>
                      <p className="font-medium">{Math.round(userStats.avgCompletionRate)}%</p>
                    </div>
                    <Progress value={userStats.avgCompletionRate} 
                      className="h-2"
                      indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Enrolled</p>
                      <p className="text-xl font-bold">{userStats.totalCoursesEnrolled}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-xl font-bold">{userStats.totalCoursesCompleted}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Skills Card */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Skills Breakdown</CardTitle>
                <CardDescription>Technologies you're learning</CardDescription>
              </CardHeader>
              <CardContent>
                {userStats.skillBreakdown.length > 0 ? (
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userStats.skillBreakdown}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score">
                          {userStats.skillBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
                    <Award className="h-12 w-12 mb-2 opacity-50" />
                    <p>Start learning to build your skills</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Enrolled Courses</h2>
              <Link to="/home">
                <Button variant="ghost" className="gap-2">
                  Explore more courses <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course.id} course={course} isEnrolled={true} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-3 mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-medium">You haven't enrolled in any courses yet</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Explore our catalog and find courses that match your interests.
                </p>
                <Link to="/home">
                  <Button>Browse Courses</Button>
                </Link>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills Development</CardTitle>
              <CardDescription>Track the skills you're developing through courses</CardDescription>
            </CardHeader>
            <CardContent>
              {userStats.skillBreakdown.length > 0 ? (
                <div className="space-y-6">
                  {userStats.skillBreakdown.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-muted-foreground">Level {Math.min(Math.ceil(skill.score), 5)} / 5</span>
                      </div>
                      <Progress 
                        value={Math.min(skill.score * 20, 100)} 
                        className="h-2"
                        indicatorClassName={`bg-[${skill.color}]`}
                      />
                      <p className="text-sm text-muted-foreground">
                        {skill.score === 1 
                          ? "You've just started learning this skill." 
                          : skill.score >= 4 
                            ? "You're becoming proficient in this skill!" 
                            : "You're making good progress with this skill."}
                      </p>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Continue learning to develop these skills further and unlock new opportunities.
                    </p>
                    <Link to="/home">
                      <Button variant="outline">Find More Skill-Building Courses</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-medium mb-2">No skills tracked yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Enroll in courses to start building your skills portfolio
                  </p>
                  <Link to="/home">
                    <Button>Explore Courses by Skill</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Learning Activity</CardTitle>
              <CardDescription>Your learning journey over time</CardDescription>
            </CardHeader>
            <CardContent>
              {userStats.recentActivity.length > 0 ? (
                <div className="space-y-8">
                  {userStats.recentActivity.map((activity, i) => (
                    <div key={i} className="relative pl-6 pb-8 before:absolute before:left-0 before:h-full before:w-[2px] before:bg-muted last:pb-0 last:before:hidden">
                      <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary -translate-x-[5px]"></div>
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.type}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-medium mb-2">No activity recorded yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Your learning activities will appear here as you engage with courses
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Personalized Recommendations */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Recommended Next Steps</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Improve {dominantStyle === 'visual' ? 'textual' : 'visual'} learning</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Your dashboard shows you prefer {dominantStyle} content. Try engaging more with {dominantStyle === 'visual' ? 'textual' : 'visual'} content to balance your learning style.
                  </p>
                  <Button variant="outline" size="sm">View Strategy</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Continue your learning</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {userStats.totalCoursesEnrolled > 0 
                      ? `You've made ${Math.round(userStats.avgCompletionRate)}% progress on your courses. Keep going!`
                      : "You haven't started any courses yet. Begin your learning journey today!"}
                  </p>
                  <Link to={userStats.totalCoursesEnrolled > 0 ? "/dashboard" : "/home"}>
                    <Button variant="outline" size="sm">
                      {userStats.totalCoursesEnrolled > 0 ? "Resume Learning" : "Browse Courses"}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
