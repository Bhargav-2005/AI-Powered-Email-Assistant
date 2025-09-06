import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. I can help you with email management, support queries, and system information. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! How can I help you today? I can assist with email management, analytics, or answer questions about the system.";
    }
    
    if (message.includes('email') && (message.includes('how') || message.includes('manage'))) {
      return "I can help you manage emails! The system automatically categorizes emails by sentiment (positive/negative/neutral) and priority (urgent/normal). You can view all emails in the dashboard, see AI-generated responses, and update their status.";
    }
    
    if (message.includes('sentiment') || message.includes('analysis')) {
      return "Sentiment analysis is performed using keyword detection. The system identifies positive words (thank, great, excellent) and negative words (angry, frustrated, urgent, problem) to categorize emails. This helps prioritize customer responses.";
    }
    
    if (message.includes('priority') || message.includes('urgent')) {
      return "Priority detection looks for urgent keywords like 'immediately', 'critical', 'emergency', 'cannot access', etc. Urgent emails are automatically moved to the top of the queue for faster processing.";
    }
    
    if (message.includes('ai') && message.includes('response')) {
      return "AI responses are generated based on email content, sentiment, and priority. The system creates contextually appropriate responses - acknowledging frustration for negative emails, being enthusiastic for positive ones, and addressing specific topics mentioned in the subject line.";
    }
    
    if (message.includes('analytics') || message.includes('stats')) {
      return "The analytics section shows today's email statistics: total emails received, pending responses, resolved issues, sentiment breakdown, and priority distribution. It also compares with yesterday's data to show trends.";
    }
    
    if (message.includes('how') && message.includes('work')) {
      return "The system works by: 1) Filtering emails with support-related keywords, 2) Analyzing sentiment and priority, 3) Extracting key information like contact details, 4) Generating appropriate AI responses, 5) Providing a dashboard for management and tracking.";
    }
    
    if (message.includes('help') || message.includes('support')) {
      return "I'm here to help! You can ask me about:\n• How email categorization works\n• Sentiment analysis details\n• Priority detection methods\n• AI response generation\n• Dashboard features\n• System analytics\n\nWhat would you like to know more about?";
    }
    
    if (message.includes('feature') || message.includes('can you')) {
      return "The system features include:\n• Automatic email filtering and categorization\n• Sentiment analysis (positive/negative/neutral)\n• Priority detection (urgent/normal)\n• AI-generated contextual responses\n• Information extraction from emails\n• Real-time analytics dashboard\n• Status tracking (pending/responded/resolved)";
    }
    
    // Default responses for unmatched queries
    const defaultResponses = [
      "That's an interesting question! The AI-powered email system is designed to streamline support workflows. Could you be more specific about what you'd like to know?",
      "I'd be happy to help you understand the system better. You can ask about email processing, sentiment analysis, or any other features.",
      "Great question! The system handles various aspects of email management. What particular area would you like me to explain?",
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-20 right-4 z-40 w-80 h-96"
          >
            <Card className="h-full flex flex-col shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-medium">AI Assistant</span>
                  <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-blue-100 mt-1">Always here to help</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: message.sender === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {message.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-2 max-w-[80%]">
                      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-white"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!inputMessage.trim() || isTyping}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;