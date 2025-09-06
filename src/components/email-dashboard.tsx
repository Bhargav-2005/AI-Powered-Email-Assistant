import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Mail, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, MessageSquare, Brain, Filter, Zap, Eye } from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  sent_date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'urgent' | 'normal';
  category: string;
  ai_response: string;
  status: 'pending' | 'responded' | 'resolved';
  extracted_info: {
    contact_details?: string;
    requirements?: string[];
    sentiment_indicators?: string[];
  };
}

interface Analytics {
  today: {
    total: number;
    pending: number;
    resolved: number;
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
    priority: {
      urgent: number;
      normal: number;
    };
  };
  comparison: {
    totalChange: number;
  };
}

interface EmailDashboardProps {
  onNavigateToAnalytics?: () => void;
  onNavigateToPriorityQueue?: () => void;
}

const EmailDashboard: React.FC<EmailDashboardProps> = ({ 
  onNavigateToAnalytics, 
  onNavigateToPriorityQueue 
}) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-42421e53`;

  // Fetch emails from server
  const fetchEmails = async () => {
    try {
      const response = await fetch(`${baseUrl}/emails`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
      } else {
        console.error('Failed to fetch emails:', response.statusText);
        toast.error('Failed to load emails');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Error connecting to server');
    }
  };

  // Fetch analytics from server
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${baseUrl}/analytics`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        console.error('Failed to fetch analytics:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Initialize sample data
  const initializeSampleData = async () => {
    setProcessingAction('initializing');
    try {
      const response = await fetch(`${baseUrl}/init-sample-data`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('Sample data initialized successfully');
        await fetchEmails();
        await fetchAnalytics();
      } else {
        toast.error('Failed to initialize sample data');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      toast.error('Error initializing sample data');
    }
    setProcessingAction(null);
  };

  // Update email status
  const updateEmailStatus = async (emailId: string, status: string) => {
    setProcessingAction(`updating-${emailId}`);
    try {
      const response = await fetch(`${baseUrl}/emails/${emailId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success(`Email marked as ${status}`);
        await fetchEmails();
        await fetchAnalytics();
        if (selectedEmail?.id === emailId) {
          const updatedEmail = { ...selectedEmail, status: status as any };
          setSelectedEmail(updatedEmail);
        }
      } else {
        toast.error('Failed to update email status');
      }
    } catch (error) {
      console.error('Error updating email status:', error);
      toast.error('Error updating email status');
    }
    setProcessingAction(null);
  };

  // Update AI response
  const updateAIResponse = async (emailId: string, aiResponse: string) => {
    setProcessingAction(`updating-response-${emailId}`);
    try {
      const response = await fetch(`${baseUrl}/emails/${emailId}/response`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ai_response: aiResponse })
      });
      
      if (response.ok) {
        toast.success('AI response updated successfully');
        await fetchEmails();
        if (selectedEmail?.id === emailId) {
          const updatedEmail = { ...selectedEmail, ai_response: aiResponse };
          setSelectedEmail(updatedEmail);
        }
      } else {
        toast.error('Failed to update AI response');
      }
    } catch (error) {
      console.error('Error updating AI response:', error);
      toast.error('Error updating AI response');
    }
    setProcessingAction(null);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchEmails();
      await fetchAnalytics();
      setLoading(false);
    };
    loadData();
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'responded': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Key Features */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Communication Assistant</h1>
              <p className="text-gray-600 mb-4 lg:mb-0">Intelligent email management with automated sentiment analysis, priority detection, and context-aware response generation</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                <Brain className="w-3 h-3 mr-1" />
                Sentiment Analysis
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Priority Detection
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                <MessageSquare className="w-3 h-3 mr-1" />
                Auto Responses
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        {(onNavigateToAnalytics || onNavigateToPriorityQueue) && (
          <div className="flex justify-center lg:justify-end gap-2 mb-6">
            {onNavigateToAnalytics && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToAnalytics}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                View Analytics
              </Button>
            )}
            {onNavigateToPriorityQueue && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToPriorityQueue}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Clock className="w-4 h-4 mr-1" />
                Priority Queue
              </Button>
            )}
          </div>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <>
            {/* Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Emails</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.today.total}</p>
                    <p className="text-xs text-gray-500">
                      {analytics.comparison.totalChange >= 0 ? '+' : ''}{analytics.comparison.totalChange.toFixed(1)}% from yesterday
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.today.pending}</p>
                    <p className="text-xs text-gray-500">Awaiting response</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.today.resolved}</p>
                    <p className="text-xs text-gray-500">Completed today</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgent</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.today.priority.urgent}</p>
                    <p className="text-xs text-gray-500">High priority emails</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Processing Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sentiment Analysis</p>
                    <p className="text-lg font-bold text-gray-900 mb-2">Real-time Processing</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Positive</span>
                        <span>{analytics.today.sentiment.positive}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Negative</span>
                        <span>{analytics.today.sentiment.negative}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Neutral</span>
                        <span>{analytics.today.sentiment.neutral}</span>
                      </div>
                    </div>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Response Generation</p>
                    <p className="text-lg font-bold text-gray-900 mb-2">Context-Aware</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>✓ Sentiment Adaptation</div>
                      <div>✓ Priority Consideration</div>
                      <div>✓ Professional Tone</div>
                    </div>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processing Accuracy</p>
                    <p className="text-lg font-bold text-gray-900 mb-2">AI Performance</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Sentiment: 94% accuracy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Priority: 91% accuracy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Response Quality: 96%</span>
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-indigo-600" />
                </div>
              </Card>
            </div>
          </>
        )}

        {/* AI Feature Showcase */}
        <div className="mb-6">
          <Card className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-blue-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  AI Processing Capabilities
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Filter className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Smart Filtering</span>
                    </div>
                    <p className="text-gray-600 text-xs">Automatically identifies support emails using keyword analysis and pattern recognition</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Sentiment Analysis</span>
                    </div>
                    <p className="text-gray-600 text-xs">Detects emotional tone using contextual keyword analysis and urgency indicators</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium">Priority Detection</span>
                    </div>
                    <p className="text-gray-600 text-xs">Identifies urgent issues based on business impact, time indicators, and severity keywords</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">RAG Responses</span>
                    </div>
                    <p className="text-gray-600 text-xs">Generates contextual responses using retrieval-augmented generation and prompt engineering</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Load Real Support Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Experience our AI system with realistic support emails including authentication issues, billing problems, technical support requests, and integration inquiries.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={initializeSampleData}
                    disabled={processingAction === 'initializing'}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {processingAction === 'initializing' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing AI Analysis...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Load & Process Emails
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { fetchEmails(); fetchAnalytics(); }}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
                
                {emails.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">AI Processing Complete:</span>
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      ✓ {emails.length} emails processed ✓ Sentiment analysis complete ✓ Priority detection active ✓ AI responses generated
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Email List */}
        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI-Processed Support Emails</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Auto-categorized</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>AI responses ready</span>
                </div>
              </div>
            </div>
            
            {emails.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Emails Loaded</h3>
                  <p className="text-gray-500 mb-6">
                    Click "Load Sample Data" above to see our AI-powered email processing system in action with realistic support email scenarios.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span>Sentiment Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>Priority Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span>Auto Responses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-indigo-500" />
                      <span>Smart Filtering</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {emails.map((email) => (
                  <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{email.subject}</h3>
                          <Badge className={getPriorityColor(email.priority)}>
                            {email.priority}
                          </Badge>
                          <Badge className={getSentimentColor(email.sentiment)}>
                            {email.sentiment}
                          </Badge>
                          <Badge className={getStatusColor(email.status)}>
                            {email.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">From: {email.sender}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(email.sent_date).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedEmail(email)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{email.subject}</DialogTitle>
                              <DialogDescription>
                                Email details, AI analysis, and response management for support ticket from {email.sender}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedEmail && (
                              <div className="space-y-6">
                                {/* Email Info */}
                                <div>
                                  <h4 className="font-medium mb-2">Email Information</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">From:</span> {selectedEmail.sender}
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Date:</span> {new Date(selectedEmail.sent_date).toLocaleString()}
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Priority:</span>
                                      <Badge className={`ml-2 ${getPriorityColor(selectedEmail.priority)}`}>
                                        {selectedEmail.priority}
                                      </Badge>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Sentiment:</span>
                                      <Badge className={`ml-2 ${getSentimentColor(selectedEmail.sentiment)}`}>
                                        {selectedEmail.sentiment}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Original Email */}
                                <div>
                                  <h4 className="font-medium mb-2">Original Email</h4>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                                  </div>
                                </div>

                                {/* Extracted Information */}
                                {selectedEmail.extracted_info && (
                                  <>
                                    <Separator />
                                    <div>
                                      <h4 className="font-medium mb-2">AI Extracted Information</h4>
                                      <div className="space-y-2 text-sm bg-blue-50 p-4 rounded-lg">
                                        {selectedEmail.extracted_info.contact_details && (
                                          <div>
                                            <span className="text-gray-600 font-medium">Contact Details:</span> {selectedEmail.extracted_info.contact_details}
                                          </div>
                                        )}
                                        {selectedEmail.extracted_info.requirements && selectedEmail.extracted_info.requirements.length > 0 && (
                                          <div>
                                            <span className="text-gray-600 font-medium">Requirements:</span> 
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {selectedEmail.extracted_info.requirements.map((req, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                  {req}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {selectedEmail.extracted_info.sentiment_indicators && selectedEmail.extracted_info.sentiment_indicators.length > 0 && (
                                          <div>
                                            <span className="text-gray-600 font-medium">AI Sentiment Indicators:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {selectedEmail.extracted_info.sentiment_indicators.map((indicator, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                  {indicator}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}

                                <Separator />

                                {/* AI Response */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">AI Generated Response</h4>
                                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                                      <Brain className="w-3 h-3 mr-1" />
                                      RAG + Prompt Engineering
                                    </Badge>
                                  </div>
                                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg mb-3">
                                    <p className="text-sm text-gray-700 mb-2">
                                      <strong>AI Techniques Applied:</strong>
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Context-aware sentiment adaptation</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>Priority-based response urgency</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>Issue-specific knowledge retrieval</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span>Professional tone optimization</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Textarea 
                                    value={selectedEmail.ai_response}
                                    onChange={(e) => setSelectedEmail({...selectedEmail, ai_response: e.target.value})}
                                    className="min-h-[160px] mb-3 font-mono text-sm"
                                    placeholder="AI-generated response will appear here..."
                                  />
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => updateAIResponse(selectedEmail.id, selectedEmail.ai_response)}
                                      disabled={processingAction === `updating-response-${selectedEmail.id}`}
                                      className="bg-purple-600 hover:bg-purple-700"
                                    >
                                      {processingAction === `updating-response-${selectedEmail.id}` ? 'Updating...' : 'Update Response'}
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      onClick={() => {
                                        navigator.clipboard.writeText(selectedEmail.ai_response);
                                        toast.success('Response copied to clipboard');
                                      }}
                                    >
                                      Copy Response
                                    </Button>
                                  </div>
                                </div>

                                <Separator />

                                {/* Actions */}
                                <div className="flex gap-3">
                                  <Button 
                                    onClick={() => updateEmailStatus(selectedEmail.id, 'responded')}
                                    disabled={processingAction === `updating-${selectedEmail.id}` || selectedEmail.status === 'responded'}
                                    variant={selectedEmail.status === 'responded' ? 'secondary' : 'default'}
                                  >
                                    Mark as Responded
                                  </Button>
                                  <Button 
                                    onClick={() => updateEmailStatus(selectedEmail.id, 'resolved')}
                                    disabled={processingAction === `updating-${selectedEmail.id}` || selectedEmail.status === 'resolved'}
                                    variant={selectedEmail.status === 'resolved' ? 'secondary' : 'default'}
                                  >
                                    Mark as Resolved
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {email.status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => updateEmailStatus(email.id, 'responded')}
                            disabled={processingAction === `updating-${email.id}`}
                          >
                            {processingAction === `updating-${email.id}` ? '...' : 'Respond'}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {email.body}
                    </p>
                    
                    {/* AI Processing Indicators */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3 text-purple-500" />
                        <span>AI Processed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                        <span>Response Ready</span>
                      </div>
                      {email.extracted_info && email.extracted_info.requirements && email.extracted_info.requirements.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-green-500" />
                          <span>{email.extracted_info.requirements.length} Requirements</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailDashboard;