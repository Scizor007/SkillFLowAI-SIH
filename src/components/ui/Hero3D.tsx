
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import * as THREE from 'three';

interface Hero3DProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const Hero3D: React.FC<Hero3DProps> = ({
  title = "Learning, Personalized to Your Style",
  subtitle = "Our AI-powered platform adapts to how you learn best, creating personalized courses that evolve as you progress.",
  ctaText = "Get Started",
  ctaLink = "/signup",
  secondaryCtaText = "Learn More",
  secondaryCtaLink = "#features",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();
  
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.8
    });
    
    const starsCount = 2500;
    const positions = new Float32Array(starsCount * 3);
    const velocities = new Float32Array(starsCount);
    const sizes = new Float32Array(starsCount);
    
    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 120;
      positions[i3 + 1] = (Math.random() - 0.5) * 120;
      positions[i3 + 2] = (Math.random() - 0.5) * 120;
      
      velocities[i] = Math.random() * 0.05 + 0.01;
      sizes[i] = Math.random() * 1.5 + 0.5;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Create multiple moons
    const createMoon = (size: number, color: number, position: THREE.Vector3, opacity: number = 0.7) => {
      const moonGeometry = new THREE.SphereGeometry(size, 32, 32);
      const moonMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity
      });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.position.copy(position);
      scene.add(moon);
      
      // Add a glowing halo
      const haloGeometry = new THREE.SphereGeometry(size * 1.2, 32, 32);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
      });
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      halo.position.copy(position);
      scene.add(halo);
      
      return { moon, halo };
    };
    
    // Create a primary large moon
    const primaryMoon = createMoon(8, 0x4338ca, new THREE.Vector3(-20, 12, -40), 0.6);
    
    // Create a medium blue moon
    const blueMoon = createMoon(5, 0x6366f1, new THREE.Vector3(25, -15, -30), 0.7);
    
    // Create a small pink moon
    const pinkMoon = createMoon(3, 0xec4899, new THREE.Vector3(15, 20, -20), 0.8);
    
    // Create a tiny green moon
    const greenMoon = createMoon(2, 0x10b981, new THREE.Vector3(-15, -18, -25), 0.9);
    
    // Set camera position
    camera.position.z = 50;
    
    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    // Handle window resize
    const handleResize = () => {
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Mouse movement effect
    const mousePosition = new THREE.Vector2();
    
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position (-1 to 1)
      mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const animate = () => {
      // Rotate the moons slowly with different speeds
      primaryMoon.moon.rotation.y += 0.002;
      primaryMoon.halo.rotation.y += 0.002;
      
      blueMoon.moon.rotation.y += 0.003;
      blueMoon.halo.rotation.y += 0.003;
      
      pinkMoon.moon.rotation.y += 0.004;
      pinkMoon.halo.rotation.y += 0.004;
      
      greenMoon.moon.rotation.y += 0.005;
      greenMoon.halo.rotation.y += 0.005;
      
      // Move moons based on mouse position with different sensitivities for parallax effect
      primaryMoon.moon.position.x += (mousePosition.x * 5 - primaryMoon.moon.position.x) * 0.01;
      primaryMoon.moon.position.y += (-mousePosition.y * 5 - primaryMoon.moon.position.y) * 0.01;
      primaryMoon.halo.position.copy(primaryMoon.moon.position);
      
      blueMoon.moon.position.x += (mousePosition.x * 8 - blueMoon.moon.position.x) * 0.015;
      blueMoon.moon.position.y += (-mousePosition.y * 8 - blueMoon.moon.position.y) * 0.015;
      blueMoon.halo.position.copy(blueMoon.moon.position);
      
      pinkMoon.moon.position.x += (-mousePosition.x * 3 - pinkMoon.moon.position.x) * 0.02;
      pinkMoon.moon.position.y += (mousePosition.y * 3 - pinkMoon.moon.position.y) * 0.02;
      pinkMoon.halo.position.copy(pinkMoon.moon.position);
      
      greenMoon.moon.position.x += (-mousePosition.x * 6 - greenMoon.moon.position.x) * 0.025;
      greenMoon.moon.position.y += (mousePosition.y * 6 - greenMoon.moon.position.y) * 0.025;
      greenMoon.halo.position.copy(greenMoon.moon.position);
      
      // Animate stars - moving forward effect with mouse influence
      const positions = starsGeometry.attributes.position.array as Float32Array;
      const sizes = starsGeometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        
        // Move stars toward the camera (z position decreases)
        positions[i3 + 2] += velocities[i];
        
        // Add some sideways movement based on mouse position
        positions[i3] += mousePosition.x * velocities[i] * 0.2;
        positions[i3 + 1] += -mousePosition.y * velocities[i] * 0.2;
        
        // If a star goes behind the camera, reset it far away
        if (positions[i3 + 2] > 50) {
          positions[i3] = (Math.random() - 0.5) * 120;
          positions[i3 + 1] = (Math.random() - 0.5) * 120;
          positions[i3 + 2] = -50;
          
          // Randomize star size for twinkling effect
          sizes[i] = Math.random() * 1.5 + 0.5;
        }
      }
      
      starsGeometry.attributes.position.needsUpdate = true;
      starsGeometry.attributes.size.needsUpdate = true;
      
      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      // Dispose of geometries and materials
      starsGeometry.dispose();
      starsMaterial.dispose();
      scene.clear();
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={containerRef}>
      {/* 3D Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full -z-10" />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 dark:to-black/60 z-0" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="glass mx-auto max-w-3xl p-12 rounded-2xl backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
          <div className="inline-block animate-fade-in">
            <span className="inline-flex items-center rounded-full px-4 py-1 text-xs font-medium bg-primary/20 text-primary mb-4">
              Introducing SkillFlowAI
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 leading-tight tracking-tight animate-scale-in">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-slide-up">
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
  );
};

export default Hero3D;
