
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "next-themes";
import { router } from "./router";
import { ChatbotProvider } from "@/context/ChatbotContext";
import { AdminProvider } from "@/context/AdminContext";
import Chatbot from "@/components/ui/Chatbot";
// import AboutUs from '@/pages/AboutUs'; // Uncomment and use if AboutUs is needed in this file
import FAQ from '@/pages/FAQ'; // Import the FAQ page
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <UserProvider>
          <AdminProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ChatbotProvider>
                <RouterProvider router={router} />
                <Chatbot />
              </ChatbotProvider>
            </TooltipProvider>
          </AdminProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
