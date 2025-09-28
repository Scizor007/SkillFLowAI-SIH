// Define and export VisualContent if missing
export interface VisualContent {
    type: 'mermaid' | 'url';
    diagram?: string;
    url?: string;
  }