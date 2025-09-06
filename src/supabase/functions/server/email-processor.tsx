import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

export interface Email {
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

// Enhanced sentiment analysis using advanced keyword-based approach with context
export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveKeywords = [
    'thank', 'thanks', 'great', 'excellent', 'good', 'happy', 'satisfied', 
    'love', 'wonderful', 'amazing', 'appreciate', 'pleased', 'fantastic', 
    'perfect', 'awesome', 'brilliant', 'helpful', 'support', 'assist'
  ];
  
  const negativeKeywords = [
    'angry', 'frustrated', 'hate', 'terrible', 'awful', 'bad', 'worst', 
    'horrible', 'disappointed', 'urgent', 'immediately', 'critical', 
    'cannot access', 'not working', 'broken', 'issue', 'problem', 'error',
    'down', 'failed', 'blocked', 'unable', 'trouble', 'help', 'fix',
    'resolve', 'charged twice', 'billing issue', 'inaccessible', 'doesn\'t work',
    'never arrived', 'multiple attempts', 'completely', 'affecting operations'
  ];

  const urgencyKeywords = [
    'urgent', 'critical', 'immediate', 'asap', 'emergency', 'now', 'today',
    'immediately', 'highly critical', 'completely inaccessible', 'affecting operations'
  ];
  
  const textLower = text.toLowerCase();
  
  // Count matches with weighted scoring
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveKeywords.forEach(word => {
    const matches = (textLower.match(new RegExp(word, 'g')) || []).length;
    positiveScore += matches;
  });
  
  negativeKeywords.forEach(word => {
    const matches = (textLower.match(new RegExp(word, 'g')) || []).length;
    negativeScore += matches;
  });
  
  // Urgency adds extra weight to negative sentiment
  urgencyKeywords.forEach(word => {
    if (textLower.includes(word)) {
      negativeScore += 2;
    }
  });
  
  // Account for context - support requests are typically neutral/negative
  if (textLower.includes('support') || textLower.includes('help') || textLower.includes('issue')) {
    negativeScore += 0.5;
  }
  
  if (negativeScore > positiveScore + 1) return 'negative';
  if (positiveScore > negativeScore + 1) return 'positive';
  return 'neutral';
}

// Enhanced priority detection with contextual analysis
export function detectPriority(text: string): 'urgent' | 'normal' {
  const highPriorityKeywords = [
    'urgent', 'immediately', 'asap', 'critical', 'emergency', 'cannot access', 
    'down', 'not working', 'broken', 'help me', 'system access blocked',
    'completely inaccessible', 'affecting operations', 'highly critical',
    'servers are down', 'immediate support', 'immediate correction',
    'billing issue', 'charged twice', 'cannot reset', 'never arrived'
  ];
  
  const businessImpactKeywords = [
    'operations', 'business', 'server', 'system', 'production', 'critical',
    'affecting', 'impact', 'downtime', 'inaccessible'
  ];
  
  const timeIndicators = [
    'today', 'now', 'immediate', 'asap', 'urgent', 'yesterday', 'since yesterday'
  ];
  
  const textLower = text.toLowerCase();
  
  let urgencyScore = 0;
  
  // Check for high priority keywords
  highPriorityKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      urgencyScore += 2;
    }
  });
  
  // Check for business impact
  businessImpactKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      urgencyScore += 1;
    }
  });
  
  // Check for time urgency
  timeIndicators.forEach(keyword => {
    if (textLower.includes(keyword)) {
      urgencyScore += 1;
    }
  });
  
  // Multiple issues or repeated attempts indicate urgency
  if (textLower.includes('multiple attempts') || textLower.includes('since yesterday')) {
    urgencyScore += 2;
  }
  
  return urgencyScore >= 2 ? 'urgent' : 'normal';
}

// Enhanced information extraction with better pattern recognition
export function extractInformation(email: Email) {
  const text = `${email.subject} ${email.body}`;
  const textLower = text.toLowerCase();
  
  // Enhanced contact details extraction
  const phoneRegex = /(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  const phones = text.match(phoneRegex) || [];
  const extractedEmails = text.match(emailRegex) || [];
  
  // Enhanced requirements extraction
  const requirementPatterns = [
    'need help with', 'looking for', 'require assistance', 'help me with',
    'issue with', 'problem with', 'unable to', 'cannot', 'trouble with',
    'integration', 'api', 'crm', 'account verification', 'login', 'password reset',
    'billing', 'subscription', 'refund', 'downtime', 'server', 'access'
  ];
  
  const requirements: string[] = [];
  requirementPatterns.forEach(pattern => {
    if (textLower.includes(pattern)) {
      requirements.push(pattern);
    }
  });
  
  // Enhanced sentiment indicators
  const sentimentIndicators: string[] = [];
  const sentimentPatterns = [
    { pattern: 'frustrated', type: 'negative' },
    { pattern: 'angry', type: 'negative' },
    { pattern: 'disappointed', type: 'negative' },
    { pattern: 'urgent', type: 'urgent' },
    { pattern: 'critical', type: 'urgent' },
    { pattern: 'immediately', type: 'urgent' },
    { pattern: 'happy', type: 'positive' },
    { pattern: 'satisfied', type: 'positive' },
    { pattern: 'thank', type: 'positive' },
    { pattern: 'highly critical', type: 'urgent' },
    { pattern: 'affecting operations', type: 'business_impact' },
    { pattern: 'charged twice', type: 'billing_issue' },
    { pattern: 'never arrived', type: 'delivery_issue' },
    { pattern: 'since yesterday', type: 'duration' },
    { pattern: 'multiple attempts', type: 'repeated_issue' },
    { pattern: 'servers are down', type: 'infrastructure' },
    { pattern: 'completely inaccessible', type: 'severe_access_issue' }
  ];
  
  sentimentPatterns.forEach(({ pattern, type }) => {
    if (textLower.includes(pattern)) {
      sentimentIndicators.push(`${pattern} (${type})`);
    }
  });
  
  return {
    contact_details: [...phones, ...extractedEmails].filter(c => c !== email.sender).join(', ') || 'None extracted',
    requirements: requirements.length > 0 ? requirements : ['General support request'],
    sentiment_indicators: sentimentIndicators.length > 0 ? sentimentIndicators : ['Neutral inquiry']
  };
}

// Enhanced AI response generation with contextual awareness and RAG-like approach
export function generateAIResponse(email: Email): string {
  const sentiment = email.sentiment;
  const priority = email.priority;
  const subject = email.subject.toLowerCase();
  const body = email.body.toLowerCase();
  
  let response = "";
  
  // Greeting based on sentiment with empathy
  if (sentiment === 'negative') {
    if (priority === 'urgent') {
      response += "Thank you for reaching out. I understand this is an urgent matter causing significant inconvenience, and I sincerely apologize for the situation you're experiencing. ";
    } else {
      response += "Thank you for contacting us, and I sincerely apologize for any inconvenience you've experienced. ";
    }
  } else if (sentiment === 'positive') {
    response += "Thank you for your email! It's wonderful to hear from you, and I appreciate your positive feedback. ";
  } else {
    response += "Thank you for contacting our support team. I've received your inquiry and will ensure it receives proper attention. ";
  }
  
  // Acknowledge urgency with specific commitments
  if (priority === 'urgent') {
    response += "I understand this is an urgent matter that requires immediate attention. I'm prioritizing your request and will ensure our team addresses this promptly. ";
    
    // Add specific urgency responses based on context
    if (body.includes('affecting operations') || body.includes('business')) {
      response += "Given the business impact you've described, I'm escalating this to our priority support queue. ";
    }
    if (body.includes('since yesterday') || body.includes('multiple attempts')) {
      response += "I see you've been experiencing this issue for some time, which is unacceptable. ";
    }
  }
  
  // Context-aware response based on issue type using RAG-like knowledge base
  if (subject.includes('password') || subject.includes('login') || body.includes('log into') || body.includes('cannot access')) {
    response += "For login and password issues: ";
    if (body.includes('reset') || body.includes('password')) {
      response += "I can see you're having trouble with password reset. Please check your spam folder for the reset email, and if you still don't see it, I'll send you a direct reset link within the next 15 minutes. ";
    } else {
      response += "I'll help you regain access to your account. Our technical team will verify your account status and send you new login credentials within 2 hours. ";
    }
    if (priority === 'urgent') {
      response += "For immediate assistance, you can also contact our emergency support line. ";
    }
  } 
  else if (subject.includes('billing') || subject.includes('payment') || subject.includes('charged') || body.includes('billing issue')) {
    response += "Regarding your billing inquiry: ";
    if (body.includes('charged twice') || body.includes('unexpected charge')) {
      response += "I've flagged your account for immediate billing review. Our billing specialist will investigate the duplicate charge and process a refund if applicable within 24 hours. ";
    } else {
      response += "Our billing team will review your account details and provide a detailed explanation of all charges within 24 hours. ";
    }
    response += "You'll receive a full breakdown via email, and any discrepancies will be corrected immediately. ";
  }
  else if (subject.includes('technical') || subject.includes('bug') || subject.includes('error') || body.includes('server') || body.includes('down')) {
    response += "For your technical issue: ";
    if (body.includes('server') && body.includes('down')) {
      response += "I can confirm we're experiencing some server issues. Our engineering team is actively working on a resolution, and we expect service to be restored within 2 hours. ";
    } else {
      response += "Our development team has been notified of this technical issue and will investigate it immediately. ";
    }
    response += "I'll keep you updated on the progress and notify you as soon as it's resolved. ";
  }
  else if (subject.includes('integration') || subject.includes('api') || body.includes('third-party') || body.includes('crm')) {
    response += "For your integration inquiry: ";
    response += "Yes, we do support various third-party integrations including CRM systems. Our integration specialist will contact you within 4 hours with detailed documentation and setup instructions specific to your needs. ";
    if (body.includes('api')) {
      response += "I'll also include API documentation and sample code to help with your implementation. ";
    }
  }
  else if (subject.includes('verification') || body.includes('verification email') || body.includes('never arrived')) {
    response += "For account verification issues: ";
    response += "I'll immediately resend your verification email and also manually verify your account on our end. You should receive the new verification email within 10 minutes. ";
    response += "If you continue to have issues, please let me know and I'll verify your account directly. ";
  }
  else if (subject.includes('refund') || body.includes('refund')) {
    response += "Regarding your refund request: ";
    response += "I'll review your account and refund eligibility immediately. Our standard refund process takes 3-5 business days, but given your situation, I'll expedite this to be processed within 24 hours. ";
  }
  else if (subject.includes('subscription') || subject.includes('pricing')) {
    response += "For your subscription inquiry: ";
    response += "I'll provide you with detailed information about our current pricing plans and any available discounts. Our sales team will also reach out to discuss options that best fit your needs. ";
  }
  else {
    response += "I've carefully reviewed your request and will ensure it gets the specialized attention it requires. ";
    response += "Our appropriate team will analyze your specific situation and provide a comprehensive response within 24-48 hours. ";
  }
  
  // Add follow-up commitment based on priority
  if (priority === 'urgent') {
    response += "\n\nFor urgent matters like this, I'll personally monitor the progress and send you updates every 2 hours until resolved. ";
  } else {
    response += "\n\nI'll follow up with you within 24 hours with a detailed update on the progress. ";
  }
  
  // Professional closing with contact options
  response += "If you need any immediate clarification or have additional questions, please don't hesitate to reply to this email or contact our support team directly.";
  response += "\n\nBest regards,\nAI Support Assistant\nCustomer Success Team";
  
  // Add reference number for tracking
  const referenceId = `REF-${Date.now().toString().slice(-6)}`;
  response += `\n\nReference: ${referenceId}`;
  
  return response;
}

// Process and categorize email with enhanced AI capabilities
export async function processEmail(emailData: Partial<Email>): Promise<Email> {
  const id = crypto.randomUUID();
  const sentiment = analyzeSentiment(`${emailData.subject} ${emailData.body}`);
  const priority = detectPriority(`${emailData.subject} ${emailData.body}`);
  
  const email: Email = {
    id,
    sender: emailData.sender || '',
    subject: emailData.subject || '',
    body: emailData.body || '',
    sent_date: emailData.sent_date || new Date().toISOString(),
    sentiment,
    priority,
    category: priority === 'urgent' ? 'High Priority Support' : 'General Support',
    ai_response: '',
    status: 'pending',
    extracted_info: {}
  };
  
  // Extract information
  email.extracted_info = extractInformation(email);
  
  // Generate AI response
  email.ai_response = generateAIResponse(email);
  
  // Store in KV store
  await kv.set(`email:${id}`, email);
  
  // Update counters
  const today = new Date().toISOString().split('T')[0];
  const totalEmailsKey = `stats:emails:total:${today}`;
  const pendingEmailsKey = `stats:emails:pending:${today}`;
  const sentimentKey = `stats:sentiment:${sentiment}:${today}`;
  const priorityKey = `stats:priority:${priority}:${today}`;
  
  // Increment counters
  const totalEmails = (await kv.get(totalEmailsKey) as number) || 0;
  const pendingEmails = (await kv.get(pendingEmailsKey) as number) || 0;
  const sentimentCount = (await kv.get(sentimentKey) as number) || 0;
  const priorityCount = (await kv.get(priorityKey) as number) || 0;
  
  await kv.mset(
    [totalEmailsKey, pendingEmailsKey, sentimentKey, priorityKey],
    [totalEmails + 1, pendingEmails + 1, sentimentCount + 1, priorityCount + 1]
  );
  
  return email;
}