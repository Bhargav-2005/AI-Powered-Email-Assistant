import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Calendar,
  TrendingUp, 
  TrendingDown,
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface AnalyticsData {
  overview: {
    totalEmails: number;
    resolutionRate: number;
    avgResponseTime: number;
    aiAccuracy: number;
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  trends: {
    emailVolume: Array<{
      date: string;
      emails: number;
      responses: number;
    }>;
  };
  performance: {
    sentimentAccuracy: number;
    priorityAccuracy: number;
    responseQuality: number;
  };
  timeRange: '7d' | '30d' | '90d';
}

interface AnalyticsDashboardProps {
  onBackToDashboard: () => void;
  onNavigateToPriorityQueue?: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  onBackToDashboard, 
  onNavigateToPriorityQueue 
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-42421e53`;

  // Sample data for demonstration
  const sampleAnalytics: AnalyticsData = {
    overview: {
      totalEmails: 341,
      resolutionRate: 93.0,
      avgResponseTime: 2.4,
      aiAccuracy: 94.2
    },
    sentiment: {
      positive: 119, // 35%
      negative: 68,  // 20%
      neutral: 154   // 45%
    },
    trends: {
      emailVolume: [
        { date: 'Jan 9', emails: 45, responses: 42 },
        { date: 'Jan 10', emails: 52, responses: 48 },
        { date: 'Jan 11', emails: 38, responses: 35 },
        { date: 'Jan 12', emails: 61, responses: 58 },
        { date: 'Jan 13', emails: 47, responses: 44 },
        { date: 'Jan 14', emails: 55, responses: 52 },
        { date: 'Jan 15', emails: 43, responses: 39 }
      ]
    },
    performance: {
      sentimentAccuracy: 94,
      priorityAccuracy: 91,
      responseQuality: 96
    },
    timeRange: '7d'
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // For demo purposes, we'll use sample data
        // In a real implementation, this would fetch from the backend
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
        setAnalytics(sampleAnalytics);
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast.error('Failed to load analytics data');
      }
      setLoading(false);
    };

    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Not Available</h2>
            <p className="text-gray-600 mb-4">Unable to load analytics data</p>
            <Button onClick={onBackToDashboard}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: analytics.sentiment.positive, color: '#10B981' },
    { name: 'Negative', value: analytics.sentiment.negative, color: '#EF4444' },
    { name: 'Neutral', value: analytics.sentiment.neutral, color: '#6B7280' }
  ];

  const performanceData = [
    { category: 'Sentiment Analysis', accuracy: analytics.performance.sentimentAccuracy },
    { category: 'Priority Detection', accuracy: analytics.performance.priorityAccuracy },
    { category: 'Response Quality', accuracy: analytics.performance.responseQuality }
  ];

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
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Insights into email performance and AI efficiency</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Last 7 days
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalEmails}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.resolutionRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgResponseTime} hours</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.aiAccuracy}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Email Volume Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Volume Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trends.emailVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="emails" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Emails Received"
                />
                <Line 
                  type="monotone" 
                  dataKey="responses" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Responses Sent"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Sentiment Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Positive: 35%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">Negative: 20%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                <span className="text-sm">Neutral: 45%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Performance Metrics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="category" type="category" width={120} />
                <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                <Bar dataKey="accuracy" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium">AI Processing</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium">Real-time Analysis</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="font-medium">Response Generation</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Optimized</Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Key Insights</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• 94% accuracy in sentiment detection</p>
                  <p>• 91% accuracy in priority classification</p>
                  <p>• 96% quality score for AI responses</p>
                  <p>• Average response time improved by 65%</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;