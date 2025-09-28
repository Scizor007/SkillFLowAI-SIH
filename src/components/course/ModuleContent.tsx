import React, { useState, useEffect } from 'react'; // Add useEffect import
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleContent as ModuleContentType } from '@/types';
import { Loader2, ThumbsUp } from 'lucide-react';
import { VisualContentViewer } from '@/components/VisualContentViewer';
import TextToSpeechButton from './TextToSpeechButton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ModuleContentProps {
  title: string;
  content: ModuleContentType | null;
  visualPoints: number;
  textualPoints: number;
  onPointsUpdated?: (type: 'visual' | 'textual', points: number) => void; // Add callback prop
}

const ModuleContent: React.FC<ModuleContentProps> = ({
  title,
  content,
  visualPoints,
  textualPoints,
  onPointsUpdated
}) => {
  const { user } = useAuth();
  const [localVisualPoints, setLocalVisualPoints] = useState(visualPoints);
  const [localTextualPoints, setLocalTextualPoints] = useState(textualPoints);
  const [markedVisualItems, setMarkedVisualItems] = useState<Set<number>>(new Set());
  const [textualContentMarked, setTextualContentMarked] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Update local state when props change
  useEffect(() => {
    setLocalVisualPoints(visualPoints);
    setLocalTextualPoints(textualPoints);
  }, [visualPoints, textualPoints]);
  
  // Scale points to a maximum of 50
  const scaledVisualPoints = Math.min(50, localVisualPoints);
  const scaledTextualPoints = Math.min(50, localTextualPoints);
  
  // Calculate percentages for progress bars (out of 50)
  const visualPercentage = (scaledVisualPoints / 50) * 100;
  const textualPercentage = (scaledTextualPoints / 50) * 100;

  // Function to update points in the database
  const updateLearningPoints = async (pointType: 'visual' | 'textual', newValue: number) => {
    if (!user) {
      toast.error("You need to be logged in to track learning progress");
      return;
    }
    
    setUpdating(true);
    try {
      console.log(`Updating ${pointType} points in database to:`, newValue);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          [pointType === 'visual' ? 'visual_points' : 'textual_points']: newValue
        })
        .eq('id', user.id);
      
      console.log('Supabase update response:', { data, error });
        
      if (error) {
        console.error("Error updating points:", error);
        toast.error("Failed to update learning progress");
      } else {
        toast.success(`Your ${pointType} learning progress has been updated!`);
        
        // Notify parent component about the updated points
        if (onPointsUpdated) {
          onPointsUpdated(pointType, newValue);
        }
        
        // Verify the update worked by fetching the latest data
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (updatedProfile) {
          console.log('Updated profile data:', updatedProfile);
        }
      }
    } catch (err) {
      console.error("Error in updateLearningPoints:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdating(false);
    }
  };

  // Handler for marking visual content as understood
  const handleMarkVisualUnderstood = (index: number) => {
    if (markedVisualItems.has(index)) return;
    
    const newVisualPoints = localVisualPoints + 1;
    setLocalVisualPoints(newVisualPoints);
    setMarkedVisualItems(prev => new Set(prev).add(index));
    
    // Pass the new value directly to the update function
    updateLearningPoints('visual', newVisualPoints);
  };

  // Handler for marking textual content as understood
  const handleMarkTextualUnderstood = () => {
    if (textualContentMarked) return;
    
    const newTextualPoints = localTextualPoints + 1;
    setLocalTextualPoints(newTextualPoints);
    setTextualContentMarked(true);
    
    // Pass the new value directly to the update function
    updateLearningPoints('textual', newTextualPoints);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500">{title}</h2>
        {content?.textualContent && (
          <TextToSpeechButton text={content.textualContent} />
        )}
      </div>
      
      {/* Learning Style Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between mb-3">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Visual Learning</span>
            <span className="text-sm font-bold bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full">
              {scaledVisualPoints}/50
            </span>
          </div>
          <Progress 
            value={visualPercentage} 
            className="h-3 rounded-full bg-blue-100 dark:bg-gray-600"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
          />
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between mb-3">
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Textual Learning</span>
            <span className="text-sm font-bold bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full">
              {scaledTextualPoints}/50
            </span>
          </div>
          <Progress 
            value={textualPercentage} 
            className="h-3 rounded-full bg-purple-100 dark:bg-gray-600"
            indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Module Content */}
      {content ? (
        <div className="space-y-8">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full p-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <TabsTrigger 
                value="content" 
                className="w-1/2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                Main Content
              </TabsTrigger>
              <TabsTrigger 
                value="visual"
                className="w-1/2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                Visual Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              {/* Text Content Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-gray-700 overflow-hidden shadow-lg">
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-indigo-900/30 border-indigo-100 dark:border-gray-700">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">Textual Content</h3>
                </div>
                <div className="p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {content.textualContent ? (
                      <>
                        <MarkdownRenderer content={content.textualContent} />
                        
                        <div className="mt-8 text-center">
                          <Button
                            onClick={handleMarkTextualUnderstood}
                            disabled={textualContentMarked || updating}
                            className={`transition-all duration-300 ${
                              textualContentMarked 
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {textualContentMarked ? 'Understood!' : 'I understood better with this explanation'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No textual content available for this module.</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visual">
              {/* Visual Content Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 overflow-hidden shadow-lg">
                <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800/50 dark:to-purple-900/30 border-purple-100 dark:border-gray-700">
                  <h3 className="font-medium text-purple-800 dark:text-purple-300">Visual Representation</h3>
                </div>
                <div className="p-6">
                  {content.visualContent && content.visualContent.length > 0 ? (
                    <div className="space-y-8">
                      {content.visualContent.map((item, index) => (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg shadow-sm">
                          <VisualContentViewer content={item} />
                          
                          <div className="mt-4 text-center">
                            <Button
                              onClick={() => handleMarkVisualUnderstood(index)}
                              disabled={markedVisualItems.has(index) || updating}
                              className={`transition-all duration-300 ${
                                markedVisualItems.has(index) 
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {markedVisualItems.has(index) ? 'Understood!' : 'I understood better with this diagram'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No visual content available for this module.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 rounded-xl">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading module content...</p>
        </div>
      )}
    </div>
  );
};

export default ModuleContent;

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div 
      className="prose dark:prose-invert max-w-none prose-headings:text-blue-700 dark:prose-headings:text-blue-300 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-lg prose-img:shadow-md"
      dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
    />
  );
};
