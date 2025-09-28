import { createContext, useContext, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCmcMnSWDJqm_OA_9MiyVYxrXhg9iAcXT8";
const genAI = new GoogleGenerativeAI(API_KEY);

const ChatbotContext = createContext(null);

export const ChatbotProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (userMessage) => {
    setMessages((prev) => [...prev, { role: "user", text: userMessage}]);

    try {
      const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: "Respond concisely. Keep answers within 2-3 sentences. Focus on key points."//false commit
});


      const result = await model.generateContent(userMessage);
      const botReply = result.response.text();

      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [...prev, { role: "bot", text: "⚠ Something went wrong. Try again later!" }]);
    }
  };

  return (
    <ChatbotContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => useContext(ChatbotContext);
