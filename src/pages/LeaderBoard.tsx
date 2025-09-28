import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medal, Trophy, Award, Loader2, Crown, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const WaterEffect = ({ children, rank }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const getGradientColor = () => {
    switch (rank) {
      case 1: return 'from-yellow-300 to-amber-500'; // Gold
      case 2: return 'from-gray-300 to-gray-500'; // Silver
      case 3: return 'from-amber-700 to-amber-900'; // Bronze
      default: return 'from-blue-300 to-blue-500'; // Default blue
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-lg p-1 group animate-pop-up"
      onMouseEnter={() => setIsAnimating(true)}
      onMouseLeave={() => setIsAnimating(false)}
    >
      {/* Water effect background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColor()} opacity-90 
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent_70%)]
        after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_70%)]
        ${isAnimating ? 'animate-water-flow' : ''}`}
      />
      {/* Content container */}
      <div className="relative bg-white dark:bg-gray-800 rounded-md p-4 transition-all duration-300 ease-in-out">
        {children}
      </div>
    </div>
  );
};

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('allTime');

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeframe]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Learner_Profile')
        .select('id, Name, Email, avatar, Skills, created_at')
        .order('created_at', { ascending: timeframe === 'newest' });
      if (error) throw error;
      const processedData = data
        .map(user => ({
          ...user,
          skillCount: user.Skills ? Object.keys(user.Skills).length : 0
        }))
        .sort((a, b) => b.skillCount - a.skillCount)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));
      setLeaderboardData(processedData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-7 w-7 text-yellow-500 animate-pop-up" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400 animate-pop-up delay-100" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700 animate-pop-up delay-200" />;
      default:
        return <span className="text-gray-500 font-medium animate-fade-in delay-300">{rank}</span>;
    }
  };

  // Top 3 users for the podium display
  const topUsers = leaderboardData.slice(0, 3);
  // Rest of the users
  const remainingUsers = leaderboardData.slice(3);

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Hero Section */}
          <motion.section
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 to-primary bg-clip-text text-transparent flex items-center justify-center gap-3">
              Leaderboard <Trophy className="h-10 w-10 text-yellow-500 animate-pop-up" />
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              See who's mastering the most skills and leading the way
            </p>
            <div className="flex justify-center mb-8">
              <span className="inline-block w-32 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-primary" />
            </div>
            <Tabs defaultValue="allTime" onValueChange={setTimeframe} className="w-auto mx-auto">
              <TabsList>
                <TabsTrigger value="allTime">All Time</TabsTrigger>
                <TabsTrigger value="newest">Newest</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.section>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading leaderboard data...</p>
              </div>
            </div>
          ) : leaderboardData.length > 0 ? (
            <>
              {/* Top 3 Podium */}
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-8 text-center">Top Achievers</h2>
                <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 h-64">
                  {/* Second Place */}
                  {topUsers[1] && (
                    <motion.div
                      className="w-full md:w-1/4 h-4/5"
                      initial={{ opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      whileHover={{ scale: 1.04 }}
                    >
                      <WaterEffect rank={2}>
                        <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.06 }}>
                          <div className="text-center mb-2">
                            <Medal className="h-8 w-8 text-gray-400 mx-auto animate-pop-up" />
                            <span className="text-xl font-bold">2nd Place</span>
                          </div>
                          <motion.div whileHover={{ scale: 1.13 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <Avatar className="h-16 w-16 border-2 border-gray-400 mb-2 transition-transform duration-300 animate-pop-up">
                              {topUsers[1].avatar ? (
                                <img 
                                  src={topUsers[1].avatar} 
                                  alt={topUsers[1].Name} 
                                  className="object-cover"
                                />
                              ) : (
                                <div className="bg-primary h-full w-full flex items-center justify-center text-white text-xl font-medium">
                                  {topUsers[1].Name?.charAt(0) || topUsers[1].Email?.charAt(0) || '?'}
                                </div>
                              )}
                            </Avatar>
                          </motion.div>
                          <h3 className="font-bold text-lg truncate w-full text-center animate-fade-in delay-100">{topUsers[1].Name || 'Anonymous'}</h3>
                          <motion.div className="flex items-center mt-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full animate-fade-in delay-200" whileHover={{ scale: 1.08 }}>
                            <span className="font-bold mr-1">{topUsers[1].skillCount}</span>
                            <Award className="h-4 w-4 text-gray-400" />
                          </motion.div>
                        </motion.div>
                      </WaterEffect>
                    </motion.div>
                  )}
                  {/* First Place */}
                  {topUsers[0] && (
                    <motion.div
                      className="w-full md:w-1/3 h-full"
                      initial={{ opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      whileHover={{ scale: 1.07 }}
                    >
                      <WaterEffect rank={1}>
                        <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.09 }}>
                          <div className="text-center mb-3">
                            <Crown className="h-10 w-10 text-yellow-500 mx-auto animate-pop-up" />
                            <span className="text-2xl font-bold">1st Place</span>
                          </div>
                          <motion.div whileHover={{ scale: 1.18 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <Avatar className="h-20 w-20 border-4 border-yellow-500 mb-3 transition-transform duration-300 animate-pop-up">
                              {topUsers[0].avatar ? (
                                <img 
                                  src={topUsers[0].avatar} 
                                  alt={topUsers[0].Name} 
                                  className="object-cover"
                                />
                              ) : (
                                <div className="bg-primary h-full w-full flex items-center justify-center text-white text-2xl font-medium">
                                  {topUsers[0].Name?.charAt(0) || topUsers[0].Email?.charAt(0) || '?'}
                                </div>
                              )}
                            </Avatar>
                          </motion.div>
                          <h3 className="font-bold text-xl truncate w-full text-center animate-fade-in delay-100">{topUsers[0].Name || 'Anonymous'}</h3>
                          <motion.div className="flex items-center mt-3 bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-full animate-fade-in delay-200" whileHover={{ scale: 1.12 }}>
                            <span className="font-bold text-lg mr-1">{topUsers[0].skillCount}</span>
                            <Award className="h-5 w-5 text-yellow-500" />
                          </motion.div>
                        </motion.div>
                      </WaterEffect>
                    </motion.div>
                  )}
                  {/* Third Place */}
                  {topUsers[2] && (
                    <motion.div
                      className="w-full md:w-1/4 h-3/4"
                      initial={{ opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      whileHover={{ scale: 1.04 }}
                    >
                      <WaterEffect rank={3}>
                        <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.06 }}>
                          <div className="text-center mb-2">
                            <Medal className="h-7 w-7 text-amber-700 mx-auto animate-pop-up" />
                            <span className="text-lg font-bold">3rd Place</span>
                          </div>
                          <motion.div whileHover={{ scale: 1.13 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <Avatar className="h-14 w-14 border-2 border-amber-700 mb-2 transition-transform duration-300 animate-pop-up">
                              {topUsers[2].avatar ? (
                                <img 
                                  src={topUsers[2].avatar} 
                                  alt={topUsers[2].Name} 
                                  className="object-cover"
                                />
                              ) : (
                                <div className="bg-primary h-full w-full flex items-center justify-center text-white text-lg font-medium">
                                  {topUsers[2].Name?.charAt(0) || topUsers[2].Email?.charAt(0) || '?'}
                                </div>
                              )}
                            </Avatar>
                          </motion.div>
                          <h3 className="font-bold truncate w-full text-center animate-fade-in delay-100">{topUsers[2].Name || 'Anonymous'}</h3>
                          <motion.div className="flex items-center mt-2 bg-amber-100 dark:bg-amber-900 px-3 py-1 rounded-full animate-fade-in delay-200" whileHover={{ scale: 1.08 }}>
                            <span className="font-bold mr-1">{topUsers[2].skillCount}</span>
                            <Award className="h-4 w-4 text-amber-700" />
                          </motion.div>
                        </motion.div>
                      </WaterEffect>
                    </motion.div>
                  )}
                </div>
              </motion.div>
              {/* Leaderboard Table */}
              <motion.div
                className="shadow-lg animate-fade-in"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2 animate-slide-in-down">
                    <Users className="h-6 w-6" /> 
                    All Learners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2">
                      <div className="col-span-1 text-center">Rank</div>
                      <div className="col-span-7">User</div>
                      <div className="col-span-4 text-right">Skills</div>
                    </div>
                    <AnimatePresence>
                      {leaderboardData.map((user, idx) => (
                        <motion.div
                          key={user.id}
                          className={`grid grid-cols-12 gap-4 items-center py-3 px-2 rounded-lg transition-colors ${user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50/60 via-amber-50/40 to-white dark:from-yellow-900/30 dark:via-amber-900/20 dark:to-gray-900/10' : 'hover:bg-blue-50/40 dark:hover:bg-blue-900/20'}`}
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 24 }}
                          transition={{ duration: 0.4, delay: idx * 0.04 }}
                          whileHover={{ scale: 1.02, boxShadow: '0 2px 16px 0 rgba(80,120,255,0.08)' }}
                        >
                          <div className="col-span-1 text-center">
                            {getRankBadge(user.rank)}
                          </div>
                          <div className="col-span-7 flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-sm">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.Name} className="object-cover" />
                              ) : (
                                <div className="bg-primary h-full w-full flex items-center justify-center text-white text-lg font-medium">
                                  {user.Name?.charAt(0) || user.Email?.charAt(0) || '?'}
                                </div>
                              )}
                            </Avatar>
                            <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                              {user.Name || 'Anonymous'}
                            </span>
                          </div>
                          <div className="col-span-4 text-right">
                            <span className="inline-flex items-center gap-1 font-bold text-primary dark:text-yellow-400">
                              {user.skillCount}
                              <Award className="h-4 w-4 text-primary dark:text-yellow-400" />
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-24">
              <p className="text-gray-500 dark:text-gray-400">No leaderboard data available.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default LeaderboardPage;