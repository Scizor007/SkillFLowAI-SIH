import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Hero from '@/components/ui/Hero';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowRight, Sparkles, BarChart3, Zap, ChevronRight, Book, MessageSquare } from 'lucide-react';
import { HoverCard } from '@radix-ui/react-hover-card';

const Index = () => {
  const [activeStep, setActiveStep] = useState(0);
  const stepsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!stepsRef.current) return;
      
      const stepsElement = stepsRef.current;
      const stepsTop = stepsElement.getBoundingClientRect().top;
      const stepsHeight = stepsElement.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate which step should be active based on scroll position
      const scrollPercentage = (windowHeight - stepsTop) / (stepsHeight + windowHeight) * 100;
      
      if (scrollPercentage < 0) {
        setActiveStep(-1);
      } else if (scrollPercentage >= 0 && scrollPercentage < 35) {
        setActiveStep(0);
      } else if (scrollPercentage >= 35 && scrollPercentage < 50) {
        setActiveStep(1);
      } else if (scrollPercentage >= 50 && scrollPercentage < 65) {
        setActiveStep(2);
      } else if (scrollPercentage >= 65) {
        setActiveStep(3);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section - Using our new 3D Hero */}
        <Hero />
        
        {/* Features Section */}
        <section id="features" className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Adapt. Learn. <span className="text-primary">Master.</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our platform uses advanced AI to create personalized learning experiences 
                that adapt to your unique learning style.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl card-hover">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Personalized Learning</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Content adapts to your learning style, focusing on visual or textual elements 
                  based on your preferences.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl card-hover">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor your learning journey with detailed insights into your strengths and areas for improvement.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl card-hover">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Generated Content</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI creates rich, relevant content on demand, ensuring you always have fresh material to learn from.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section - Animated */}
        <section className="py-24 bg-gray-50 dark:bg-gray-800" ref={stepsRef}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our platform makes learning new skills efficient and effective through personalization.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-12">
                <div className={`transition-all duration-500 ${activeStep === 0 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                  <div className="flex">
                    <div className="mr-6">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${activeStep === 0 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} font-bold transition-colors duration-300`}>
                        1
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Sign up and tell us about your existing skills and experience.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className={`transition-all duration-500 ${activeStep === 1 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                  <div className="flex">
                    <div className="mr-6">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${activeStep === 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} font-bold transition-colors duration-300`}>
                        2
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Explore Courses</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Browse our catalog of courses or create your own custom learning path.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className={`transition-all duration-500 ${activeStep === 2 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                  <div className="flex">
                    <div className="mr-6">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${activeStep === 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} font-bold transition-colors duration-300`}>
                        3
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Learn Your Way</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Our AI adapts content to match your learning style as you progress.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className={`transition-all duration-500 ${activeStep === 3 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                  <div className="flex">
                    <div className="mr-6">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${activeStep === 3 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} font-bold transition-colors duration-300`}>
                        4
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Apply Your Skills</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Use our job search feature to find opportunities that match your new skills.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Link to="/signup">
                  <Button className="mt-6 rounded-full font-medium px-8 py-6 shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                    Start Learning Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="relative">
                {/* Step 1 Visualization - Profile */}
                <div className={`relative inset-0 w-full h-[500px] bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-xl glass transition-all duration-500 ${activeStep === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="h-8 bg-gray-100 dark:bg-gray-600 rounded-lg w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded-full w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded-full w-2/3 mb-8"></div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded-lg"></div>
                      <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded-lg"></div>
                      <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded-lg"></div>
                      <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded-lg"></div>
                    </div>
                    
                    <div className="h-10 bg-primary rounded-lg w-1/3 mt-8"></div>
                  </div>
                </div>
                
                {/* Step 2 Visualization - Explore Courses */}
                <div className={`absolute inset-0 w-full h-[500px] bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-xl glass transition-all duration-500 ${activeStep === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded-lg w-1/2 mb-6"></div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg overflow-hidden bg-blue-100 dark:bg-blue-900/30 h-36">
                      <div className="h-24 bg-primary/20"></div>
                      <div className="p-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden bg-blue-100 dark:bg-blue-900/30 h-36">
                      <div className="h-24 bg-primary/20"></div>
                      <div className="p-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden bg-blue-100 dark:bg-blue-900/30 h-36">
                      <div className="h-24 bg-primary/20"></div>
                      <div className="p-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden bg-blue-100 dark:bg-blue-900/30 h-36">
                      <div className="h-24 bg-primary/20"></div>
                      <div className="p-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <div className="h-8 bg-gray-100 dark:bg-gray-600 rounded-lg w-1/4"></div>
                    <div className="h-8 bg-primary rounded-lg w-1/4"></div>
                  </div>
                </div>
                
                {/* Step 3 Visualization - Learn */}
                <div className={`absolute inset-0 w-full h-[500px] bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-xl glass transition-all duration-500 ${activeStep === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-1/3 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full w-1/2"></div>
                    </div>
                    <div className="w-2/3 bg-gray-50 dark:bg-gray-600 rounded-lg p-3">
                      <div className="h-32 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">
                        <Book className="h-12 w-12 text-primary/50" />
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-500 rounded-full w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-500 rounded-full w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-500 rounded-full w-1/2"></div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                    <div className="h-8 w-20 bg-primary rounded-lg"></div>
                  </div>
                  
                  <div className="mt-4 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/30 mr-2"></div>
                      <div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 4 Visualization - Apply Skills */}
                <div className={`absolute inset-0 w-full h-[500px] bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-xl glass transition-all duration-500 ${activeStep === 3 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded-lg w-1/2 mb-6"></div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-40 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full w-24"></div>
                      </div>
                      <div className="h-9 w-24 bg-primary rounded-lg"></div>
                    </div>
                    
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-40 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full w-24"></div>
                      </div>
                      <div className="h-9 w-24 bg-primary rounded-lg"></div>
                    </div>
                    
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-40 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full w-24"></div>
                      </div>
                      <div className="h-9 w-24 bg-primary rounded-lg"></div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <div className="h-10 w-40 bg-primary rounded-lg"></div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary/10 rounded-2xl -z-10"></div>
                <div className="absolute -top-6 -left-6 h-24 w-24 bg-blue-100 dark:bg-blue-900/30 rounded-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary/10 to-blue-400/10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform How You Learn?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Join thousands of learners who are already experiencing the future of personalized education.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="rounded-full font-medium px-8 py-6 shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full px-8 py-6 border-2 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
