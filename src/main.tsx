import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
//import '@reactflow/background/dist/style.css';
import { Background } from "reactflow";
import "reactflow/dist/style.css";



createRoot(document.getElementById("root")!).render(<App />);
