import React from 'react';
import { BackgroundGradientAnimation } from './ui/background-gradient-animation';
import { GradientButton } from './ui/gradient-button';
import { Vortex } from './ui/vortex';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mail, 
  Brain, 
  Zap, 
  BarChart3, 
  Shield, 
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Smart Email Filtering",
      description: "Automatically identifies and filters support-related emails using advanced keyword detection and pattern recognition."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Sentiment Analysis",
      description: "Analyzes email content to determine customer sentiment (positive, negative, neutral) for better response prioritization."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Priority Detection",
      description: "Instantly identifies urgent emails using keyword analysis to ensure critical issues get immediate attention."
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Context-Aware Responses",
      description: "Generates professional, contextually appropriate AI responses that adapt to customer sentiment and urgency."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Analytics",
      description: "Comprehensive dashboard with email statistics, sentiment trends, and performance metrics."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Automated Workflow",
      description: "Streamlines the entire support process from email receipt to response generation and status tracking."
    }
  ];

  const stats = [
    { number: "80%", label: "Faster Response Times" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "60%", label: "Reduced Manual Work" },
    { number: "24/7", label: "Automated Processing" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <BackgroundGradientAnimation containerClassName="h-screen">
        <div className="relative z-10 flex items-center justify-center h-full px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30">
                ✨ AI-Powered Email Management
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Intelligent Communication
                <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent block">
                  Assistant
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your email support workflow with AI-powered categorization, sentiment analysis, 
                and automated response generation. Handle hundreds of emails efficiently while maintaining 
                professional quality.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <GradientButton 
                  onClick={onGetStarted}
                  className="text-lg px-8 py-4"
                >
                  Get Started Now
                </GradientButton>
                
                <GradientButton 
                  variant="variant"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-lg px-8 py-4"
                >
                  Learn More
                </GradientButton>
              </div>
            </motion.div>
          </div>
        </div>
      </BackgroundGradientAnimation>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Support Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines advanced machine learning with intuitive design 
              to revolutionize how organizations handle customer support emails.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent system processes emails through multiple AI layers to deliver 
              accurate categorization and contextually appropriate responses.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                step: "1", 
                title: "Email Filtering", 
                description: "System automatically filters emails containing support keywords like 'help', 'support', 'query', or 'request'.",
                icon: <Mail className="w-6 h-6" />
              },
              { 
                step: "2", 
                title: "AI Analysis", 
                description: "Advanced sentiment analysis and priority detection using machine learning algorithms.",
                icon: <Brain className="w-6 h-6" />
              },
              { 
                step: "3", 
                title: "Smart Categorization", 
                description: "Emails are categorized by sentiment, priority, and automatically sorted in priority queue.",
                icon: <AlertTriangle className="w-6 h-6" />
              },
              { 
                step: "4", 
                title: "Response Generation", 
                description: "Context-aware AI generates professional responses tailored to customer sentiment and inquiry type.",
                icon: <CheckCircle className="w-6 h-6" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {step.step}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white p-2 rounded-full">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-8">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Vortex
          backgroundColor="black"
          rangeY={800}
          particleCount={500}
          baseHue={220}
          className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full min-h-[400px]"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-white text-3xl md:text-5xl font-bold text-center mb-6">
              Ready to Transform Your Support Workflow?
            </h2>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Join thousands of organizations already using AI to improve their customer support efficiency and response quality.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <GradientButton
                onClick={onGetStarted}
                className="text-lg px-8 py-4"
              >
                Start Free Trial
              </GradientButton>
              <button className="px-8 py-4 text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </Vortex>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AI Communication Assistant</h3>
              <p className="text-gray-400">
                Intelligent email management powered by advanced AI technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email Filtering</li>
                <li>Sentiment Analysis</li>
                <li>Priority Detection</li>
                <li>AI Responses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Privacy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>API Reference</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Communication Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;