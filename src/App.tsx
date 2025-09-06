import React, { useState } from 'react';
import LandingPage from './components/landing-page';
import EmailDashboard from './components/email-dashboard';
import AnalyticsDashboard from './components/analytics-dashboard';
import PriorityQueue from './components/priority-queue';
import ChatWidget from './components/chat-widget';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Home, Mail, BarChart3, MessageSquare, Clock, TrendingUp } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'analytics' | 'priority-queue'>('landing');

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleAnalytics = () => {
    setCurrentView('analytics');
  };

  const handlePriorityQueue = () => {
    setCurrentView('priority-queue');
  };

  return (
    <div className="min-h-screen">
      {currentView === 'landing' ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : (
        <div className="relative">
          {/* Enhanced Navigation */}
          <nav className="bg-white border-b shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleBackToLanding}
                    className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                  >
                    AI Communication Assistant
                  </button>
                  
                  {/* Navigation Links */}
                  <div className="hidden md:flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToLanding}
                      className="flex items-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Home
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDashboard}
                      className={`flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      <Mail className="w-4 h-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAnalytics}
                      className={`flex items-center gap-2 ${currentView === 'analytics' ? 'bg-purple-50 text-purple-600' : ''}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePriorityQueue}
                      className={`flex items-center gap-2 ${currentView === 'priority-queue' ? 'bg-red-50 text-red-600' : ''}`}
                    >
                      <Clock className="w-4 h-4" />
                      Priority Queue
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      AI Active
                    </div>
                    <div className="text-sm text-gray-600">
                      Real-time Processing
                    </div>
                  </div>
                  
                  {/* Mobile Menu */}
                  <div className="md:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToLanding}
                    >
                      <Home className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          
          {/* Main Content */}
          {currentView === 'dashboard' && (
            <EmailDashboard 
              onNavigateToAnalytics={handleAnalytics}
              onNavigateToPriorityQueue={handlePriorityQueue}
            />
          )}
          {currentView === 'analytics' && (
            <AnalyticsDashboard 
              onBackToDashboard={handleDashboard} 
              onNavigateToPriorityQueue={handlePriorityQueue}
            />
          )}
          {currentView === 'priority-queue' && (
            <PriorityQueue 
              onBackToDashboard={handleDashboard}
              onNavigateToAnalytics={handleAnalytics}
            />
          )}
        </div>
      )}
      
      {/* Chat Widget - Always visible */}
      <ChatWidget />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default App;