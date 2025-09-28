import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Book, CheckCircle } from 'lucide-react';

interface Module {
  title: string;
  description: string;
}

interface CourseModulesProps {
  modules: Module[];
  completedModules?: string[];
}

const CourseModules: React.FC<CourseModulesProps> = ({ 
  modules = [], 
  completedModules = [] 
}) => {
  // Early return if no modules
  if (modules.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-gray-500 dark:text-gray-400">No modules available for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Accordion 
        type="single" 
        collapsible 
        className="w-full space-y-2"
      >
        {modules.map((module, index) => {
          const moduleId = `module-${index}`;
          const isCompleted = completedModules.includes(moduleId);
          
          return (
            <AccordionItem 
              key={moduleId} 
              value={moduleId} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <AccordionTrigger 
                className={`
                  hover:bg-gray-50 dark:hover:bg-gray-800 
                  px-4 py-3 
                  rounded-t-lg 
                  text-left 
                  ${isCompleted ? 'bg-green-50 dark:bg-green-900/20' : ''}
                `}
              >
                <div className="flex items-center w-full">
                  <div className={`
                    ${isCompleted 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-primary/10'
                    } 
                    p-2 rounded-full mr-3
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Book className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      Module {index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {module.title}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent 
                className="
                  px-4 py-3 
                  bg-gray-50 dark:bg-gray-800 
                  rounded-b-lg
                "
              >
                <div className="ml-10">
                  <p className="text-gray-700 dark:text-gray-300">
                    {module.description}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default CourseModules;