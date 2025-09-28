import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";
import starsVideo from "../assets/stars.mp4"; // Adjust the path as necessary

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "Learning, Personalized to Your Style",
  subtitle = "Our AI-powered platform adapts to how you learn best, creating personalized courses that evolve as you progress.",
  ctaText = "Get Started",
  ctaLink = "/signup",
  secondaryCtaText = "Learn More",
  secondaryCtaLink = "#features",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  
  // Create exactly 100 fixed star objects with random positions
  const createDirectionalStars = () => {
    return Array.from({ length: 100 }, (_, i) => {
      const x = Math.random() * 100; // Random x position (0-100%)
      const y = Math.random() * 100; // Random y position (0-100%)
      
      // Determine direction based on position
      // Top region (y < 25%)
      // Left region (x < 25%)
      // Right region (x > 75%)
      // Bottom region (y > 75%)
      // Middle region (everywhere else)
      
      let directionX = 0;
      let directionY = 0;
      
      if (y < 25) {
        // Top region - move up
        directionY = -1;
      } else if (y > 75) {
        // Bottom region - move down
        directionY = 1;
      }
      
      if (x < 25) {
        // Left region - move left
        directionX = -1;
      } else if (x > 75) {
        // Right region - move right
        directionX = 1;
      }
      
      // If in middle and no direction set, use defaults
      if (directionX === 0 && directionY === 0) {
        // For middle region, move based on which edge is closest
        if (x < 50 && y >= 25 && y <= 75) {
          directionX = -1; // Closer to left
        } else if (x >= 50 && y >= 25 && y <= 75) {
          directionX = 1;  // Closer to right
        }
      }
      
      return {
        id: i,
        size: Math.random() * 4 + 2, // Size between 2-6px
        x: x, 
        y: y,
        opacity: Math.random() * 0.8 + 0.2, // Opacity between 0.2-1
        blinkSpeed: Math.random() * 3 + 1, // Blink animation speed variation
        directionX: directionX,
        directionY: directionY
      };
    });
  };

  // Generate the directional stars only once
  const directionalStars = useRef(createDirectionalStars());

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full"
      style={{ height: '150vh' }} // Taller than viewport to enable scrolling
    >
      <div className="sticky top-0 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background elements */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
        >
          <source
            src={starsVideo}
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0" />
        
        {/* Directional glowing stars container */}
        <div 
          className="absolute inset-0 z-5 overflow-hidden"
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          {directionalStars.current.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                left: `${star.x}%`,
                top: `${star.y}%`,
                opacity: scrollY > 600 ? 0 : star.opacity,
                boxShadow: `0 0 ${star.size * 2}px ${star.size / 2}px rgba(255, 255, 255, 0.8)`,
                animation: `blink ${star.blinkSpeed}s infinite alternate`,
                transform: `translate(${scrollY * star.directionX * 0.5}px, ${scrollY * star.directionY * 0.5}px)`,
                transition: 'transform 0.1s ease-out, opacity 0.5s ease-out',
              }}
            />
          ))}
        </div>
        
        {/* Animated background shapes */}
        <div 
          className="z-20 absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{ 
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: Math.max(0, 1 - scrollY / 600)
          }}
        />
        <div 
          className="z-20 absolute top-40 right-10 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"
          style={{ 
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: Math.max(0, 1 - scrollY / 600)
          }}
        />
        <div 
          className="z-20 absolute -bottom-8 left-20 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"
          style={{ 
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: Math.max(0, 1 - scrollY / 600)
          }}
        />
        
        {/* Content */}
        <div 
          className="relative z-10 max-w-8xl mx-auto px-6 py-24 text-center"
          style={{ 
            transform: `translateY(${-scrollY * 0.4}px)`,
            opacity: Math.max(0, 1 - scrollY / 500)
          }}
        >
          <div className="relative">
            {/* Floating Elements Container */}
            <div className="absolute inset-0 -top-32 pointer-events-none">
              {/* Main Animated Card */}
              <motion.div
                initial={{ y: 0, rotate: -20 }}
                animate={{ 
                  y: [-20, 20, -20],
                  rotate: [-20, -20, -20]
                }}
                transition={{ 
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="z-10 relative left-[-5%] top-4 w-64 h-40 bg-gray-800 rounded-xl shadow-lg opacity-70"
                style={{ 
                  transform: `translateY(${scrollY * 0.15}px) rotate(-20deg)`,
                  opacity: Math.max(0, 1 - scrollY / 500)
                }}
              >
                <div className="p-4">
                  <div className="w-full h-4 bg-gray-700 rounded-full mb-2"></div>
                  <div className="w-3/4 h-4 bg-gray-700 rounded-full mb-4"></div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg"></div>
                    <div className="w-10 h-10 bg-primary/20 rounded-lg"></div>
                    <div className="w-10 h-10 bg-primary/20 rounded-lg"></div>
                  </div>
                </div>
              </motion.div>

              {/* Secondary Card */}
              <motion.div
                initial={{ y: 0, rotate: 12 }}
                animate={{ 
                  y: [20, -20, 20],           
                  rotate: [12, 8, 12]
                }}
                transition={{ 
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="z-10 relative right-[-85%] bottom-[-55%] w-64 h-40 bg-gray-800 rounded-xl shadow-lg opacity-70"
                style={{ 
                  transform: `translateY(${scrollY * 0.15}px) rotate(12deg)`,
                  opacity: Math.max(0, 1 - scrollY / 500)
                }}
              >
                <div className="p-4">
                  <div className="w-full h-4 bg-gray-700 rounded-full mb-2"></div>
                  <div className="w-3/4 h-4 bg-gray-700 rounded-full mb-4"></div>
                  <div className="flex gap-2 z-20">
                    <div className="w-10 h-10 bg-blue-900/30 rounded-lg"></div>
                    <div className="w-10 h-10 bg-blue-900/30 rounded-lg"></div>
                    <div className="w-10 h-10 bg-blue-900/30 rounded-lg"></div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div
              className="mx-auto max-w-3xl p-12 rounded-3xl bg-transparent border-2 backdrop-blur-sm shadow-2xl"
              style={{ 
                transform: `translateY(${scrollY * 0.1}px)`,
                opacity: Math.max(0, 1 - scrollY / 600)
              }}
            >
              <div className="inline-block animate-fade-in">
                <span className="inline-flex items-center rounded-full px-4 py-1 text-xs font-medium bg-primary/10 text-primary mb-4">
                  Introducing SkillFlowAI
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold pb-3 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 leading-tight tracking-tight animate-scale-in">
                {title}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-slide-up">
                {subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-300">
                <Link to={ctaLink}>
                  <Button size="lg" className="rounded-full font-medium px-8 py-6 shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                    {ctaText}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <Link to={secondaryCtaLink}>
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 border-2 transition-all duration-300">
                    {secondaryCtaText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicator to scroll down */}
      <div 
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white text-center"
        style={{ 
          opacity: Math.max(0, 1 - scrollY / 300)
        }}
      >
        <div className="animate-bounce mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
        <p className="text-sm font-medium">Scroll Down</p>
      </div>
      
      {/* Next section trigger visibility check */}
      <div 
        className="h-screen w-full"
        style={{ 
          marginTop: '100vh',
          opacity: scrollY > 900 ? 1 : 0, 
          transition: 'opacity 0.9s ease-in-out',
          pointerEvents: scrollY > 800 ? 'auto' : 'none' 
        }}
      >
        
      </div>
    </div>
  );
};


export default Hero;