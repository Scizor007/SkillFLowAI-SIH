
import React from 'react';
import { Book } from 'lucide-react';

interface EmptyModuleStateProps {
  message?: string;
}

const EmptyModuleState: React.FC<EmptyModuleStateProps> = ({ 
  message = "Select a module from the sidebar to view its content."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
        <Book className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Content Selected</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        {message}
      </p>
    </div>
  );
};

export default EmptyModuleState;
