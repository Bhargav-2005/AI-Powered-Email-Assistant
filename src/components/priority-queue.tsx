import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { 
  ArrowLeft, 
  Pause,
  RotateCcw,
  Play,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Zap,
  Activity,
  Timer
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface QueueEmail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  priority: 'urgent' | 'normal';
  status: 'waiting' | 'processing' | 'completed';
  queuePosition: number;
  estimatedTime: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  ai_response?: string;
}

interface QueueStats {
  processing: {
    current: number;
    total: number;
    progress: number;
  };
  counts: {
    urgent: number;
    normal: number;
    completed: number;
    processing: number;
  };
  isActive: boolean;
}

interface PriorityQueueProps {
  onBackToDashboard: () => void;
  onNavigateToAnalytics?: () => void;
}

const PriorityQueue: React.FC<PriorityQueueProps> = ({ 
  onBackToDashboard, 
  onNavigateToAnalytics 
}) => {
  const [emails, setEmails] = useState<QueueEmail[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<QueueEmail | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // Sample data for demonstration
  const sampleEmails: QueueEmail[] = [
    {
      id: '1',
      sender: 'alex@company.com',
      subject: 'Urgent request system access blocked',
      body: 'Hi, I need immediate help. My system access has been blocked and I cannot access critical customer data for today\'s presentation. This is affecting our client meeting scheduled in 2 hours.',
      priority: 'urgent',
      status: 'completed',
      queuePosition: 1,
      estimatedTime: '2 min',
      category: 'Authentication',
      sentiment: 'negative',
      ai_response: 'Thank you for reaching out about your urgent access issue. I understand this is critical for your client meeting. I\'ve immediately escalated this to our technical team and created priority ticket #AUTH-2024-001. Please try logging in again in 5 minutes. If the issue persists, call our emergency line at ext. 999.'
    },
    {
      id: '2',
      sender: 'support@customer.com',
      subject: 'Immediate support needed for billing error',
      body: 'We found a critical billing discrepancy that needs immediate attention. Our finance team noticed we\'ve been charged incorrectly for the past 3 months.',
      priority: 'urgent',
      status: 'waiting',
      queuePosition: 2,
      estimatedTime: '5 min',
      category: 'Billing',
      sentiment: 'negative'
    },
    {
      id: '3',
      sender: 'query@business.com',
      subject: 'Support needed for login issue',
      body: 'I\'m having trouble logging into my account. Can someone help me reset my password? It\'s not urgent, just when you have time.',
      priority: 'normal',
      status: 'waiting',
      queuePosition: 1,
      estimatedTime: '15 min',
      category: 'Authentication',
      sentiment: 'neutral'
    },
    {
      id: '4',
      sender: 'info@company.com',
      subject: 'Query about product pricing',
      body: 'Could you please provide information about your enterprise pricing plans? We\'re considering upgrading our current subscription.',
      priority: 'normal',
      status: 'waiting',
      queuePosition: 2,
      estimatedTime: '20 min',
      category: 'Sales',
      sentiment: 'positive'
    }
  ];

  const sampleStats: QueueStats = {
    processing: {
      current: 1,
      total: 7,
      progress: 14.3
    },
    counts: {
      urgent: 5,
      normal: 2,
      completed: 1,
      processing: 0
    },
    isActive: true
  };

  useEffect(() => {
    const loadQueueData = async () => {
      setLoading(true);
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setEmails(sampleEmails);
        setStats(sampleStats);
      } catch (error) {
        console.error('Error loading queue data:', error);
        toast.error('Failed to load priority queue data');
      }
      setLoading(false);
    };

    loadQueueData();
  }, []);

  const handlePauseQueue = () => {
    setIsProcessing(false);
    toast.info('Queue processing paused');
  };

  const handleResumeQueue = () => {
    setIsProcessing(true);
    toast.success('Queue processing resumed');
  };

  const handleResetQueue = () => {
    toast.info('Queue reset - all items moved back to pending');
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Activity className="w-4 h-4 animate-pulse" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const urgentEmails = emails.filter(email => email.priority === 'urgent');
  const normalEmails = emails.filter(email => email.priority === 'normal');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Priority Queue</h1>
              <p className="text-gray-600">Real-time email processing based on urgency</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToAnalytics && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToAnalytics}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Analytics
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={isProcessing ? handlePauseQueue : handleResumeQueue}
              className="flex items-center gap-2"
            >
              {isProcessing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isProcessing ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetQueue}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Queue
            </Button>
          </div>
        </div>

        {/* Processing Status */}
        {stats && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Queue Processing Status</h3>
              </div>
              <Badge className={isProcessing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {isProcessing ? 'Processing' : 'Paused'}
              </Badge>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {stats.processing.current} of {stats.processing.total} emails processed</span>
                <span>{stats.processing.progress.toFixed(1)}% complete</span>
              </div>
              <Progress value={stats.processing.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.counts.urgent}</div>
                <div className="text-sm text-red-700">Urgent</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.counts.normal}</div>
                <div className="text-sm text-blue-700">Normal</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.counts.completed}</div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.counts.processing}</div>
                <div className="text-sm text-yellow-700">Processing</div>
              </div>
            </div>
          </Card>
        )}

        {/* Queue Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Urgent Priority Queue */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">Urgent Priority Queue ({urgentEmails.length})</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {urgentEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 border rounded-lg ${
                    email.status === 'completed' ? 'bg-green-50 border-green-200' :
                    email.status === 'processing' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(email.status)}
                        <h4 className="font-medium text-gray-900 text-sm">{email.subject}</h4>
                      </div>
                      <p className="text-xs text-gray-600">{email.sender}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(email.status)}>
                          {email.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          #{email.queuePosition} in queue
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-2">
                        <Timer className="w-3 h-3 inline mr-1" />
                        {email.estimatedTime}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEmail(email)}
                            className="text-xs"
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{email.subject}</DialogTitle>
                            <DialogDescription>
                              Priority queue item details for {email.sender}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedEmail && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Email Details</h4>
                                <div className="bg-gray-50 p-3 rounded text-sm">
                                  <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                                </div>
                              </div>
                              {selectedEmail.ai_response && (
                                <div>
                                  <h4 className="font-medium mb-2">AI Generated Response</h4>
                                  <div className="bg-blue-50 p-3 rounded text-sm">
                                    <p>{selectedEmail.ai_response}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Badge className={getPriorityColor(selectedEmail.priority)}>
                                  {selectedEmail.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {selectedEmail.category}
                                </Badge>
                                <Badge className={getStatusColor(selectedEmail.status)}>
                                  {selectedEmail.status}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Normal Priority Queue */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Normal Priority Queue ({normalEmails.length})</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {normalEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 border rounded-lg ${
                    email.status === 'completed' ? 'bg-green-50 border-green-200' :
                    email.status === 'processing' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(email.status)}
                        <h4 className="font-medium text-gray-900 text-sm">{email.subject}</h4>
                      </div>
                      <p className="text-xs text-gray-600">{email.sender}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(email.status)}>
                          {email.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          #{email.queuePosition} in queue
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-2">
                        <Timer className="w-3 h-3 inline mr-1" />
                        {email.estimatedTime}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEmail(email)}
                            className="text-xs"
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{email.subject}</DialogTitle>
                            <DialogDescription>
                              Priority queue item details for {email.sender}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedEmail && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Email Details</h4>
                                <div className="bg-gray-50 p-3 rounded text-sm">
                                  <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                                </div>
                              </div>
                              {selectedEmail.ai_response && (
                                <div>
                                  <h4 className="font-medium mb-2">AI Generated Response</h4>
                                  <div className="bg-blue-50 p-3 rounded text-sm">
                                    <p>{selectedEmail.ai_response}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Badge className={getPriorityColor(selectedEmail.priority)}>
                                  {selectedEmail.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {selectedEmail.category}
                                </Badge>
                                <Badge className={getStatusColor(selectedEmail.status)}>
                                  {selectedEmail.status}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PriorityQueue;