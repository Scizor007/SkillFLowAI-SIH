
export interface User {
  id: string;
  name: string;
  email: string;
  skills: string[];
  visualPoints: number;
  textualPoints: number;
  createdAt: string;
  updatedAt: string;
  isAdmin?: boolean; // Added for admin functionality
  isBanned?: boolean; // Added for ban functionality
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  skillsOffered: string[];
  creatorId: string;
  creatorName: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  systemPrompt: string;
  courseModules?: Module[]; // For storing course modules
}

export interface Module {
  id: string;
  title: string;
  course_id: string;  // Primary field from database
  courseId?: string;  // Alias for course_id
  order: number;
  orderNum?: number;  // Alias for order
  type?: 'visual' | 'textual' | 'mixed';
  description: string;  // This is required
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;  // Database field name
  updated_at?: string;  // Database field name
}

export interface ModuleContent {
  id: string;
  moduleId: string;
  content: string;
  visualContent?: VisualContent[];
  textualContent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  courseId: string; // Main identifier for the course relationship
  moduleId?: string; // Optional reference to a specific module
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  type: 'visual' | 'textual';
  imageUrl?: string;  // URL for visual question images
}

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  completedModules: string[];
  quizScores: Record<string, number>;
  lastAccessed: string;
  personalizedContent?: Record<string, any>;
}

// Define VisualContent interface
export interface VisualContent {
  type: 'mermaid' | 'url' | 'excalidraw';
  diagram?: string;
  url?: string;
  title?: string;
  description?: string;
}

// Added types for admin functionality
export interface AdminState {
  isAdminMode: boolean;
  adminPassword: string;
}
