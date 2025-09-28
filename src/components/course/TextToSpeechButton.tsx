
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Headphones, Loader2, Pause, Play, X } from 'lucide-react';
import { toast } from 'sonner';

interface TextToSpeechButtonProps {
  text: string;
}

const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ text }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleTextToSpeech = async () => {
    if (!text) {
      toast.error("No content available to read");
      return;
    }

    const trimmedText = text.slice(0, 3000);

    setIsLoading(true);
    setIsSpeaking(true); // Set speaking to true
    setIsPaused(false); // Reset paused state when new speech starts
    try {
      toast.info("Reading aloud...");
      const speech = new SpeechSynthesisUtterance(trimmedText);
      speech.onend = () => {
        setIsSpeaking(false); // Reset speaking when speech ends
        toast.success("Finished speaking!");
      };
      speech.onpause = () => {
        setIsPaused(true); // Set paused when speech is paused
      };
      window.speechSynthesis.speak(speech);
    } catch (error: any) {
      console.error("Speech error:", error);
      toast.error("Unable to speak the text");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseResume = () => {
    if (window.speechSynthesis.speaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        toast.info("Speech resumed");
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
        toast.info("Speech paused");
      }
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPaused(false);
    setIsSpeaking(false); // Reset speaking state when speech is stopped
    toast.info("Speech stopped");
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleTextToSpeech} 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        disabled={isLoading || !text || isSpeaking}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Headphones className="h-4 w-4" />
        )}
        {isLoading ? "Processing..." : "Listen"}
      </Button>

      {window.speechSynthesis.speaking && !isPaused && (
        <Button 
          onClick={handlePauseResume} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Pause className="h-4 w-4" />
          Pause
        </Button>
      )}

      {window.speechSynthesis.speaking && isPaused && (
        <Button 
          onClick={handlePauseResume} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Play className="h-4 w-4" />
          Resume
        </Button>
      )}

      {window.speechSynthesis.speaking && (
        <Button 
          onClick={handleStop} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <X className="h-4 w-4" /> {/* Use X as Stop button */}
          Stop
        </Button>
      )}
    </div>
  );
};

export default TextToSpeechButton;
