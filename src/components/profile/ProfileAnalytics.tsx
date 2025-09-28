import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { Brain, Lightbulb, BookOpen, Award, Loader2, TrendingUp, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  
  // State for all analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalLearningHours: 0,
    weeklyChange: 0,
    coursesCompleted: 0,
    monthlyCompletionChange: 0,
    visualPoints: 0,
    textualPoints: 0,
    skillData: [],
    learningData: [],
    preferenceData: [],
    learningTrend: []
  });
  
  // Beautiful color palette
  const COLORS = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    success: '#10b981',
    info: '#0ea5e9',
    warning: '#f59e0b',
    danger: '#ef4444',
    gray: '#6b7280'
  };
  
  // Custom gradient definitions for charts
  const gradients = {
    skills: ['#6366f1', '#8b5cf6'],
    hours: ['#0ea5e9', '#06b6d4'],
    preference: ['#8b5cf6', '#ec4899'],
    trend: ['#10b981', '#059669']
  };
  
  // Fetch analytics data from Supabase
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // 1. Fetch user profile for learning points
        const { data: profileData } = await supabase
          .from('profiles')
          .select('visual_points, textual_points')
          .eq('id', user.id)
          .single();
          
        const visualPoints = profileData?.visual_points || 0;
        const textualPoints = profileData?.textual_points || 0;
        
        // 2. Fetch user course enrollments and completions
        const { data: courseData } = await supabase
          .from('user_course_progress')
          .select('*, courses(title, skill_offered)')
          .eq('user_id', user.id);
          
        const completedCourses = courseData?.filter(course => course.completion_percentage >= 100) || [];
        
        // 3. Generate skill data from completed courses
        const skillMap = new Map();
        courseData?.forEach(entry => {
          const skills = entry.courses?.skill_offered?.split(',') || [];
          skills.forEach(skill => {
            const trimmedSkill = skill.trim();
            if (trimmedSkill) {
              const currentValue = skillMap.get(trimmedSkill) || 0;
              // Calculate skill progress based on course completion
              const progressContribution = (entry.completion_percentage || 0) / 20; // Scale to max 5 per course
              skillMap.set(trimmedSkill, currentValue + progressContribution);
            }
          });
        });
        
        const skillData = Array.from(skillMap.entries()).map(([name, value]) => ({
          name,
          value: Math.min(100, Math.round(value * 20)) // Scale to 0-100
        })).sort((a, b) => b.value - a.value).slice(0, 6); // Top 6 skills
        
        // 4. Fetch user learning activity over time
        const dateFormat = timeRange === 'week' ? 'EEE' : timeRange === 'month' ? 'dd MMM' : 'MMM';
        const daysToFetch = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
        
        const { data: activityData } = await supabase
          .from('user_course_progress')
          .select('last_viewed_at, time_spent')
          .eq('user_id', user.id)
          .gte('last_viewed_at', subDays(new Date(), daysToFetch).toISOString())
          .order('last_viewed_at', { ascending: true });
        
        // Group activity by day
        const activityByDay = new Map();
        activityData?.forEach(activity => {
          const day = format(parseISO(activity.last_viewed_at), dateFormat);
          const currentHours = activityByDay.get(day) || 0;
          activityByDay.set(day, currentHours + (activity.time_spent || 0) / 60);
        });
        
        // Fill in missing days with zeros
        const learningData = [];
        for (let i = 0; i < daysToFetch; i++) {
          const date = subDays(new Date(), daysToFetch - i - 1);
          const day = format(date, dateFormat);
          learningData.push({
            name: day,
            hours: activityByDay.get(day) || 0
          });
        }
        
        // Calculate total hours and weekly change
        const totalHours = learningData.reduce((sum, day) => sum + day.hours, 0);
        const previousPeriodHours = activityData
          ?.filter(a => {
            const activityDate = parseISO(a.last_viewed_at);
            const cutoffDate = subDays(new Date(), daysToFetch * 2);
            return activityDate >= cutoffDate && activityDate < subDays(new Date(), daysToFetch);
          })
          .reduce((sum, a) => sum + ((a.time_spent || 0) / 60), 0) || 0;
          
        const weeklyChange = previousPeriodHours > 0 
          ? ((totalHours - previousPeriodHours) / previousPeriodHours) * 100 
          : 100;
          
        // 5. Generate preference data
        const totalPoints = visualPoints + textualPoints;
        const preferenceData = [
          { name: 'Visual', value: visualPoints, color: COLORS.primary },
          { name: 'Textual', value: textualPoints, color: COLORS.secondary }
        ];
        
        // 6. Generate learning trend data (cumulative hours over time)
        const learningTrend = [];
        let cumulativeHours = 0;
        learningData.forEach((day, index) => {
          cumulativeHours += day.hours;
          if (index % Math.max(1, Math.floor(learningData.length / 10)) === 0 || index === learningData.length - 1) {
            learningTrend.push({
              name: day.name,
              hours: cumulativeHours
            });
          }
        });
        
        // 7. Calculate monthly course completion change
        const completedLastMonth = completedCourses.filter(course => {
          const completionDate = parseISO(course.last_viewed_at);
          return completionDate >= subDays(new Date(), 30);
        }).length;
        
        const completedPreviousMonth = completedCourses.filter(course => {
          const completionDate = parseISO(course.last_viewed_at);
          return completionDate >= subDays(new Date(), 60) && completionDate < subDays(new Date(), 30);
        }).length;
        
        const monthlyCompletionChange = completedPreviousMonth > 0 
          ? ((completedLastMonth - completedPreviousMonth) / completedPreviousMonth) * 100 
          : completedLastMonth > 0 ? 100 : 0;
          
        // Update state with all fetched data
        setAnalyticsData({
          totalLearningHours: Number(totalHours.toFixed(1)),
          weeklyChange: Number(weeklyChange.toFixed(0)),
          coursesCompleted: completedCourses.length,
          monthlyCompletionChange: Number(monthlyCompletionChange.toFixed(0)),
          visualPoints,
          textualPoints,
          skillData,
          learningData,
          preferenceData,
          learningTrend
        });
        
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user, timeRange]);
  
  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Learning Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="h-80">
            <div className="w-full h-full bg-muted/20 flex items-center justify-center rounded-md">
              <Loader2 className="h-8 w-8 animate-spin text-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const dominantStyle = analyticsData.visualPoints > analyticsData.textualPoints ? 'Visual' : 'Textual';
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-2 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          Learning Analytics
        </h2>
        
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === 'quarter' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('quarter')}
          >
            Quarter
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalLearningHours}</div>
            <p className={`text-xs flex items-center ${analyticsData.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData.weeklyChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
              {analyticsData.weeklyChange >= 0 ? '+' : ''}{analyticsData.weeklyChange}% from previous {timeRange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.coursesCompleted}</div>
            <p className={`text-xs flex items-center ${analyticsData.monthlyCompletionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData.monthlyCompletionChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
              {analyticsData.monthlyCompletionChange >= 0 ? '+' : ''}{analyticsData.monthlyCompletionChange}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className={dominantStyle === 'Visual' ? 'border-indigo-200 dark:border-indigo-800' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${dominantStyle === 'Visual' ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
              Visual Score
            </CardTitle>
            <Brain className={`h-4 w-4 ${dominantStyle === 'Visual' ? 'text-indigo-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.visualPoints}</div>
            <p className="text-xs text-muted-foreground">
              {dominantStyle === 'Visual' ? 'Your preferred learning style' : 'Secondary learning style'}
            </p>
          </CardContent>
        </Card>
        <Card className={dominantStyle === 'Textual' ? 'border-purple-200 dark:border-purple-800' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${dominantStyle === 'Textual' ? 'text-purple-600 dark:text-purple-400' : ''}`}>
              Textual Score
            </CardTitle>
            <Lightbulb className={`h-4 w-4 ${dominantStyle === 'Textual' ? 'text-purple-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.textualPoints}</div>
            <p className="text-xs text-muted-foreground">
              {dominantStyle === 'Textual' ? 'Your preferred learning style' : 'Secondary learning style'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skills Progress</TabsTrigger>
          <TabsTrigger value="activity">Learning Activity</TabsTrigger>
          <TabsTrigger value="preference">Learning Style</TabsTrigger>
          <TabsTrigger value="trend">Learning Trend</TabsTrigger>
        </TabsList>
        
        <TabsContent value="skills" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Progress</CardTitle>
              <CardDescription>
                Your skill development based on completed courses and modules
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {analyticsData.skillData.length > 0 ? (
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.skillData} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <YAxis dataKey="name" type="category" scale="band" width={80} />
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <Tooltip
                        formatter={(value) => [`${value}% mastery`, 'Proficiency']}
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <defs>
                        <linearGradient id="skillGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={gradients.skills[0]} />
                          <stop offset="100%" stopColor={gradients.skills[1]} />
                        </linearGradient>
                      </defs>
                      <Bar
                        dataKey="value"
                        fill="url(#skillGradient)"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No skill data yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mb-4">
                    Complete courses and modules to build your skills profile
                  </p>
                  <Button asChild>
                    <a href="/courses">Explore Courses</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Activity</CardTitle>
              <CardDescription>
                Hours spent learning per day over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {analyticsData.learningData.some(day => day.hours > 0) ? (
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.learningData}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={gradients.hours[0]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={gradients.hours[1]} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        tickCount={7}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(value) => value === 0 ? '0' : `${value}h`}
                        tick={{ fontSize: 12 }}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <Tooltip
                        formatter={(value) => [`${value.toFixed(1)} hours`, 'Learning Time']}
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="hours"
                        stroke={gradients.hours[0]}
                        fillOpacity={1}
                        fill="url(#colorHours)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No activity recorded yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mb-4">
                    Your learning time will be tracked as you engage with courses
                  </p>
                  <Button asChild>
                    <a href="/courses">Start Learning</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preference" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Style Preference</CardTitle>
              <CardDescription>
                Your balance between visual and textual learning approaches
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {analyticsData.preferenceData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="pieGradient1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.primary} />
                        <stop offset="100%" stopColor={COLORS.info} />
                      </linearGradient>
                      <linearGradient id="pieGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.secondary} />
                        <stop offset="100%" stopColor={COLORS.accent} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={analyticsData.preferenceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="url(#pieGradient1)" />
                      <Cell fill="url(#pieGradient2)" />
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, 'Points']}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend verticalAlign="top" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Brain className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Learning style not determined yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mb-4">
                    Interact with both visual and textual content to discover your learning preference
                  </p>
                  <Button asChild>
                    <a href="/courses">Start Learning</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trend" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progression</CardTitle>
              <CardDescription>
                Cumulative learning hours over {timeRange}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {analyticsData.learningTrend.length > 0 && analyticsData.totalLearningHours > 0 ? (
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.learningTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => value === 0 ? '0' : `${value.toFixed(1)}h`}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value.toFixed(1)} hours`, 'Total Learning Time']}
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={gradients.trend[0]} />
                          <stop offset="100%" stopColor={gradients.trend[1]} />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="hours"
                        stroke="url(#trendGradient)"
                        strokeWidth={3}
                        dot={{ fill: gradients.trend[0], strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: gradients.trend[1] }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No learning trend data yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mb-4">
                    Start learning consistently to see your progress over time
                  </p>
                  <Button asChild>
                    <a href="/courses">Start Learning</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Learning insights based on data */}
      {!loading && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Learning Insights</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base mb-1">Learning Style Analysis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {dominantStyle === 'Visual' ? (
                        <>You learn <strong>best visually</strong>. Look for courses with diagrams, charts, and videos.</>
                      ) : (
                        <>You learn <strong>best through text</strong>. Courses with detailed explanations will help you progress faster.</>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base mb-1">Consistency Tracker</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {analyticsData.learningData.filter(d => d.hours > 0).length >= 5 ? (
                        <>Great job! You're learning <strong>consistently</strong>. This is key to long-term skill mastery.</>
                      ) : analyticsData.totalLearningHours > 0 ? (
                        <>Try to learn more <strong>consistently</strong>. Regular sessions lead to better retention.</>
                      ) : (
                        <>Start your learning journey today. <strong>Consistency</strong> is the key to mastering new skills.</>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAnalytics;
