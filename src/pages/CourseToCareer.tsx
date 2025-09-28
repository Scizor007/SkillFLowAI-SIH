import React, { useState, useEffect, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GraduationCap, Target, Lightbulb, Rocket, Save, RefreshCw, Users, ChevronRight, Sparkles } from 'lucide-react';
import "reactflow/dist/style.css";

// Initialize Gemini
const API_KEY = 'AIzaSyDzuqV0Pm_TNmyUunUlrAjXGdwjxhOCeCw';
const genAI = new GoogleGenerativeAI(API_KEY);

// Mock components for demonstration
const Button = ({ children, onClick, disabled, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl",
    outline: "border-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white"
  };
  const sizes = {
    default: "px-6 py-3 text-sm",
    sm: "px-4 py-2 text-xs"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl shadow-2xl ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-6 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-bold text-white ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-slate-400 mt-2 ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${className}`}
    rows={4}
    {...props}
  />
);

const Label = ({ children, htmlFor, className = '', ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-semibold text-slate-300 mb-2 ${className}`}
    {...props}
  >
    {children}
  </label>
);

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 z-10">
        {children}
      </div>
    </div>
  );
};

const DialogTrigger = ({ children, asChild }) => children;
const DialogContent = ({ children }) => children;
const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-xl font-bold text-white mb-2">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-slate-400">{children}</p>;

const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-left hover:bg-slate-600 transition-colors"
      >
        {value || "Connect with Mentor"}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
          {React.Children.map(children, child => 
            React.cloneElement(child, { onValueChange, setIsOpen })
          )}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({ children }) => children;
const SelectContent = ({ children }) => children;
const SelectValue = ({ placeholder }) => placeholder;
const SelectItem = ({ value, children, onValueChange, setIsOpen }) => (
  <button
    onClick={() => {
      onValueChange(value);
      setIsOpen(false);
    }}
    className="w-full px-4 py-2 text-left hover:bg-slate-600 text-white transition-colors"
  >
    {children}
  </button>
);

interface CourseRecommendation {
  name: string;
  explanation: string;
}

interface Roadmap {
  nodes: Array<{
    id: string;
    type?: string;
    data: { label: string };
    position: { x: number; y: number };
    style?: React.CSSProperties;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    animated?: boolean;
    style?: React.CSSProperties;
  }>;
}

interface CourseToCareerState {
  interests: string;
  strengths: string;
  goals: string;
  recommendations: CourseRecommendation[];
  careerParagraph: string;
  roadmap: Roadmap;
  loading: boolean;
}

const CourseToCareer = () => {
  const [state, setState] = useState({
    interests: '',
    strengths: '',
    goals: '',
    recommendations: [],
    careerParagraph: '',
    roadmap: { nodes: [], edges: [] },
    loading: false,
  });
  const [showRefineDialog, setShowRefineDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [error, setError] = useState<string>('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync state with React Flow
  useEffect(() => {
    setNodes(state.roadmap.nodes || []);
    setEdges(state.roadmap.edges || []);
  }, [state.roadmap, setNodes, setEdges]);

  const handleGenerate = async () => {
    if (!state.interests || !state.strengths || !state.goals) {
      alert('Please fill all fields');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));
    setError('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Act as an intelligent career advisor for students exploring education and career options.

User Profile:

Interests & Passions: ${state.interests}

Strengths: ${state.strengths}

Career Goals: ${state.goals}

Step 1: Analyze these and suggest 3-5 related courses or academic streams that match, with a short explanation for each.

Step 2: Generate a personalized suggestion paragraph describing ideal career paths, required skills, and real-world opportunities that fit the user’s profile.

Step 3: Construct a JSON roadmap with nodes and edges forming a clear, connected tree (hierarchical) diagram for React Flow.

Limit to 4-5 nodes total: Start with one "Interest Selection" node at the top, branching into up to 3 recommended courses.

For each course, include 1 key milestone node and 1 career outcome node.

Assign unique node IDs, descriptive labels, and vertical positions with clear logical flow from top to bottom.

Connect all nodes with edges to show a clear path (Interest → Course → Milestone → Career).

Use colors: green for start, blue for courses, orange for milestones, red for careers.

Use concise text, no node overlaps, and ensure a simple vertical layout for easy comprehension.

Example branch: Interest Selection -> Course (e.g., Computer Science) -> Milestone (e.g., JEE Exam) -> Career Outcome (e.g., Software Engineer). 

IMPORTANT: Output ONLY the JSON object as plain text, no markdown. Start directly with { and end with }.

{
"recommendations": [ ... ],
"careerParagraph": "...",
"roadmap": {
"nodes": [ ... ],
"edges": [ ... ] 
}
}

Tips: Structure must form a tree, not a linear flow. Ensure clarity for React Flow visualization.`;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      // Clean the response: Remove common markdown wrappers
      const cleanResponse = response
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/^\s*json\s*/g, '')
        .trim();

      let data;
      try {
        data = JSON.parse(cleanResponse);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from Gemini: ${cleanResponse.substring(0, 200)}...`);
      }

      // Validate required fields
      if (!data.recommendations || !data.careerParagraph || !data.roadmap || !data.roadmap.nodes || !data.roadmap.edges) {
        throw new Error('Incomplete response from Gemini - missing required sections.');
      }

      setState(prev => ({
        ...prev,
        recommendations: data.recommendations,
        careerParagraph: data.careerParagraph,
        roadmap: data.roadmap,
        loading: false,
      }));
    } catch (err: any) {
      console.error('Gemini API error:', err);
      setError(err.message || 'Failed to generate career path. Please try again.');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveRoadmap = () => {
    alert('Roadmap saved successfully!');
  };

  const handleEnroll = (courseName) => {
    alert(`Redirecting to enroll in ${courseName}`);
  };

  const handleRefine = () => {
    setState({
      interests: '',
      strengths: '',
      goals: '',
      recommendations: [],
      careerParagraph: '',
      roadmap: { nodes: [], edges: [] },
      loading: false,
    });
    setShowRefineDialog(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">AI-Powered Career Guidance</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Course to Career Advisor
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Discover your perfect career path with personalized recommendations tailored to your unique interests, strengths, and goals.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Input Form */}
        <Card className="mb-8 backdrop-blur-sm bg-slate-800/90">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <CardTitle>Tell us about yourself</CardTitle>
                <CardDescription>Share your passions and aspirations to get personalized career guidance.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <Label htmlFor="interests">Interests & Passions</Label>
                </div>
                <Textarea
                  id="interests"
                  value={state.interests}
                  onChange={(e) => setState(prev => ({ ...prev, interests: e.target.value }))}
                  placeholder="e.g., Coding, artificial intelligence, web development, mobile apps..."
                  className="bg-slate-700/50"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-400" />
                  <Label htmlFor="strengths">Your Strengths</Label>
                </div>
                <Textarea
                  id="strengths"
                  value={state.strengths}
                  onChange={(e) => setState(prev => ({ ...prev, strengths: e.target.value }))}
                  placeholder="e.g., Problem-solving, analytical thinking, creativity, teamwork..."
                  className="bg-slate-700/50"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-400" />
                  <Label htmlFor="goals">Career Goals</Label>
                </div>
                <Textarea
                  id="goals"
                  value={state.goals}
                  onChange={(e) => setState(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="e.g., Become a software engineer, start a tech company, work remotely..."
                  className="bg-slate-700/50"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={state.loading} 
              className="w-full py-4 text-lg font-semibold"
            >
              {state.loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating Your Path with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate My Career Path
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {state.recommendations.length > 0 && (
          <Card className="mb-8 backdrop-blur-sm bg-slate-800/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-green-400" />
                </div>
                Recommended Learning Paths
              </CardTitle>
              <CardDescription>Curated courses and streams perfectly matched to your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.recommendations.map((rec, idx) => (
                <div key={idx} className="group p-6 border border-slate-600 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:bg-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {rec.name}
                      </h3>
                      <p className="text-slate-300 leading-relaxed">{rec.explanation}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleEnroll(rec.name)}
                      className="ml-4 group-hover:scale-105 transition-transform"
                    >
                      Explore Course
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Career Path */}
        {state.careerParagraph && (
          <Card className="mb-8 backdrop-blur-sm bg-slate-800/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                Your Personalized Career Path
              </CardTitle>
              <CardDescription>Detailed insights and opportunities tailored just for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-lg">
                  {state.careerParagraph}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roadmap */}
        {state.roadmap.nodes.length > 0 && (
          <Card className="mb-8 backdrop-blur-sm bg-slate-800/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <Rocket className="w-6 h-6 text-orange-400" />
                </div>
                Your Learning Roadmap
              </CardTitle>
              <CardDescription>Interactive pathway generated by Gemini AI – drag nodes, zoom, and explore your career journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={reactFlowWrapper}
                className="h-96 w-full rounded-lg bg-slate-900 border border-slate-700"
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  nodeTypes={{ 
                    input: ({ data }) => <div className="px-4 py-2 bg-green-500 text-white rounded shadow-md whitespace-pre-line text-center">{data.label}</div>, 
                    output: ({ data }) => <div className="px-4 py-2 bg-red-500 text-white rounded shadow-md whitespace-pre-line text-center">{data.label}</div>,
                    default: ({ data }) => <div className="px-4 py-2 bg-blue-500 text-white rounded shadow-md whitespace-pre-line text-center">{data.label}</div>
                  }}
                >
                  <Background color="#334155" />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
              </div>
              <p className="text-sm text-slate-500 mt-2 text-center">Powered by React Flow – Click and drag to navigate your roadmap!</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {state.recommendations.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={handleSaveRoadmap} variant="secondary">
              <Save className="w-4 h-4 mr-2" />
              Save Roadmap
            </Button>
            
            <Button variant="outline" onClick={() => setShowRefineDialog(true)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refine Suggestions
            </Button>
            
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Connect with Mentor" />
              </SelectTrigger>
              <SelectContent>
                {state.recommendations.map((rec, idx) => (
                  <SelectItem key={idx} value={rec.name}>
                    <Users className="w-4 h-4 mr-2 inline" />
                    Mentor for {rec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Refine Dialog */}
        <Dialog open={showRefineDialog} onOpenChange={setShowRefineDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refine Your Career Path</DialogTitle>
              <DialogDescription>
                Want to explore different options? Start fresh with new inputs to discover alternative career paths.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleRefine} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              <Button variant="outline" onClick={() => setShowRefineDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CourseToCareer;