
import React from 'react';
import Mermaid from 'mermaid';
import { VisualContent } from '@/types';

// Initialize mermaid
Mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

interface VisualContentViewerProps {
  content: VisualContent;
}

export const VisualContentViewer: React.FC<VisualContentViewerProps> = ({ content }) => {
  const [svgContent, setSvgContent] = React.useState<string>('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const renderMermaid = async () => {
      if (content.type === 'mermaid' && content.diagram) {
        try {
          // Generate a unique ID for this diagram
          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
          
          // Render the diagram
          const { svg } = await Mermaid.render(id, content.diagram);
          setSvgContent(svg);
        } catch (error) {
          console.error('Failed to render mermaid diagram:', error);
          setSvgContent(`<p class="text-red-500">Error rendering diagram</p>`);
        }
      }
    };

    if (content.type === 'mermaid') {
      renderMermaid();
    }
  }, [content]);

  if (content.type === 'url' && content.url) {
    return (
      <div className="mb-4">
        {content.title && <h4 className="font-medium mb-2">{content.title}</h4>}
        <img 
          src={content.url} 
          alt={content.description || content.title || 'Visual content'} 
          className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
        />
        {content.description && (
          <p className="text-sm text-gray-500 mt-1">{content.description}</p>
        )}
      </div>
    );
  }

  if (content.type === 'mermaid') {
    return (
      <div className="mb-4">
        {content.title && <h4 className="font-medium mb-2">{content.title}</h4>}
        <div 
          ref={containerRef}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          dangerouslySetInnerHTML={{ __html: svgContent }} 
        />
        {content.description && (
          <p className="text-sm text-gray-500 mt-1">{content.description}</p>
        )}
      </div>
    );
  }

  // Default fallback for unsupported types
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <p className="text-gray-500">Unsupported visual content type: {content.type}</p>
    </div>
  );
};
