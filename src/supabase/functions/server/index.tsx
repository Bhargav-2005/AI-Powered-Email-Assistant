import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { processEmail, type Email } from "./email-processor.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-42421e53/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all emails with filtering and sorting
app.get("/make-server-42421e53/emails", async (c) => {
  try {
    const emails = await kv.getByPrefix("email:");
    
    // Sort by priority (urgent first) then by date
    const sortedEmails = emails.sort((a: Email, b: Email) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
      return new Date(b.sent_date).getTime() - new Date(a.sent_date).getTime();
    });
    
    return c.json({ emails: sortedEmails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return c.json({ error: 'Failed to fetch emails' }, 500);
  }
});

// Get email by ID
app.get("/make-server-42421e53/emails/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const email = await kv.get(`email:${id}`) as Email;
    
    if (!email) {
      return c.json({ error: 'Email not found' }, 404);
    }
    
    return c.json({ email });
  } catch (error) {
    console.error('Error fetching email:', error);
    return c.json({ error: 'Failed to fetch email' }, 500);
  }
});

// Create new email (simulate receiving an email)
app.post("/make-server-42421e53/emails", async (c) => {
  try {
    const emailData = await c.req.json();
    
    // Validate required fields
    if (!emailData.sender || !emailData.subject || !emailData.body) {
      return c.json({ error: 'Missing required fields: sender, subject, body' }, 400);
    }
    
    // Process the email
    const processedEmail = await processEmail(emailData);
    
    return c.json({ email: processedEmail, message: 'Email processed successfully' });
  } catch (error) {
    console.error('Error processing email:', error);
    return c.json({ error: 'Failed to process email' }, 500);
  }
});

// Update email status
app.put("/make-server-42421e53/emails/:id/status", async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    const email = await kv.get(`email:${id}`) as Email;
    if (!email) {
      return c.json({ error: 'Email not found' }, 404);
    }
    
    // Update email status
    email.status = status;
    await kv.set(`email:${id}`, email);
    
    // Update counters
    const today = new Date().toISOString().split('T')[0];
    if (status === 'responded' || status === 'resolved') {
      const resolvedKey = `stats:emails:resolved:${today}`;
      const pendingKey = `stats:emails:pending:${today}`;
      
      const resolved = (await kv.get(resolvedKey) as number) || 0;
      const pending = (await kv.get(pendingKey) as number) || 0;
      
      await kv.mset(
        [resolvedKey, pendingKey],
        [resolved + 1, Math.max(0, pending - 1)]
      );
    }
    
    return c.json({ email, message: 'Email status updated successfully' });
  } catch (error) {
    console.error('Error updating email status:', error);
    return c.json({ error: 'Failed to update email status' }, 500);
  }
});

// Update AI response
app.put("/make-server-42421e53/emails/:id/response", async (c) => {
  try {
    const id = c.req.param('id');
    const { ai_response } = await c.req.json();
    
    const email = await kv.get(`email:${id}`) as Email;
    if (!email) {
      return c.json({ error: 'Email not found' }, 404);
    }
    
    email.ai_response = ai_response;
    await kv.set(`email:${id}`, email);
    
    return c.json({ email, message: 'AI response updated successfully' });
  } catch (error) {
    console.error('Error updating AI response:', error);
    return c.json({ error: 'Failed to update AI response' }, 500);
  }
});

// Get analytics/stats
app.get("/make-server-42421e53/analytics", async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Get today's stats
    const [
      totalEmails,
      pendingEmails,
      resolvedEmails,
      positiveEmails,
      negativeEmails,
      neutralEmails,
      urgentEmails,
      normalEmails
    ] = await Promise.all([
      kv.get(`stats:emails:total:${today}`) as Promise<number>,
      kv.get(`stats:emails:pending:${today}`) as Promise<number>,
      kv.get(`stats:emails:resolved:${today}`) as Promise<number>,
      kv.get(`stats:sentiment:positive:${today}`) as Promise<number>,
      kv.get(`stats:sentiment:negative:${today}`) as Promise<number>,
      kv.get(`stats:sentiment:neutral:${today}`) as Promise<number>,
      kv.get(`stats:priority:urgent:${today}`) as Promise<number>,
      kv.get(`stats:priority:normal:${today}`) as Promise<number>
    ]);
    
    // Get yesterday's stats for comparison
    const yesterdayTotal = await kv.get(`stats:emails:total:${yesterday}`) as number || 0;
    
    const analytics = {
      today: {
        total: totalEmails || 0,
        pending: pendingEmails || 0,
        resolved: resolvedEmails || 0,
        sentiment: {
          positive: positiveEmails || 0,
          negative: negativeEmails || 0,
          neutral: neutralEmails || 0
        },
        priority: {
          urgent: urgentEmails || 0,
          normal: normalEmails || 0
        }
      },
      comparison: {
        totalChange: ((totalEmails || 0) - yesterdayTotal) / Math.max(1, yesterdayTotal) * 100
      }
    };
    
    return c.json({ analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Initialize sample data with real support emails
app.post("/make-server-42421e53/init-sample-data", async (c) => {
  try {
    // Clear existing email data
    const existingEmails = await kv.getByPrefix("email:");
    if (existingEmails.length > 0) {
      await kv.mdel(existingEmails.map((email: Email) => `email:${email.id}`));
    }
    
    // Real support email data for AI processing demonstration
    const sampleEmails = [
      {
        sender: "joe@startup.io",
        subject: "Help required with account verification",
        body: "Do you support integration with third-party APIs? Specifically, I'm looking for CRM integration options.",
        sent_date: "2025-08-19T20:58:00.000Z"
      },
      {
        sender: "diana@client.co",
        subject: "General query about subscription",
        body: "Hi team, I am unable to log into my account since yesterday. Could you please help me resolve this issue?",
        sent_date: "2025-08-25T08:58:00.000Z"
      },
      {
        sender: "alice@startup.io",
        subject: "Immediate support needed for billing error",
        body: "Hello, I wanted to ask if there was a detailed breakdown. The last line doesn't seem to work.",
        sent_date: "2025-08-20T15:58:00.000Z"
      },
      {
        sender: "alice@example.com",
        subject: "Urgent: system access blocked",
        body: "Hi team, I am unable to log into my account since yesterday. Could you please help me resolve this issue?",
        sent_date: "2025-08-21T08:58:00.000Z"
      },
      {
        sender: "questions@startup.io",
        subject: "Questions: integration issue with",
        body: "I cannot log into my password. The reset link doesn't seem to work.",
        sent_date: "2025-08-20T19:58:00.000Z"
      },
      {
        sender: "alice@example.com",
        subject: "Critical help needed for downtime",
        body: "Hi team, I am unable to log into my account since yesterday. Could you please help me resolve this issue?",
        sent_date: "2025-08-18T08:58:00.000Z"
      },
      {
        sender: "bob@customer.com",
        subject: "Urgent: system access blocked",
        body: "Despite multiple attempts, I cannot reset my password. The reset link doesn't seem to work.",
        sent_date: "2025-08-19T13:58:00.000Z"
      },
      {
        sender: "diana@client.co",
        subject: "Support needed for login issue",
        body: "I am facing issues with verifying my account. The verification email never arrived. Can you assist?",
        sent_date: "2025-08-23T06:58:00.000Z"
      },
      {
        sender: "alice@example.com",
        subject: "General query about subscription",
        body: "Our servers are down, and we need immediate support. This is highly critical.",
        sent_date: "2025-08-26T09:25:00.000Z"
      },
      {
        sender: "joe@example.com",
        subject: "Help required with account verification",
        body: "Do you support integration with third-party APIs? Specifically, I'm looking for CRM integration options.",
        sent_date: "2025-08-21T08:13:00.000Z"
      },
      {
        sender: "diana@client.co",
        subject: "Support needed for login issue",
        body: "Hi team, I am unable to log into my account since yesterday. Could you please help me resolve this issue?",
        sent_date: "2025-08-26T08:15:00.000Z"
      },
      {
        sender: "joe@example.com",
        subject: "Help required with account verification",
        body: "Do you support integration with third-party APIs? Specifically, I'm looking for CRM integration options.",
        sent_date: "2025-08-24T08:15:00.000Z"
      },
      {
        sender: "alice@example.com",
        subject: "Critical help needed for downtime",
        body: "Our servers are down, and we need immediate support. This is highly critical.",
        sent_date: "2025-08-21T08:19:00.000Z"
      },
      {
        sender: "bob@customer.com",
        subject: "Query about product pricing",
        body: "I am facing issues with verifying my account. The verification email never arrived. Can you assist?",
        sent_date: "2025-08-24T08:19:00.000Z"
      },
      {
        sender: "alice@example.com",
        subject: "General query about subscription",
        body: "I am facing issues with verifying my account. The verification email never arrived. Can you assist?",
        sent_date: "2025-08-26T07:25:00.000Z"
      },
      {
        sender: "joe@example.com",
        subject: "Immediate support needed for billing error",
        body: "Despite multiple attempts, I cannot reset my password. The reset link doesn't seem to work.",
        sent_date: "2025-08-19T07:58:00.000Z"
      },
      {
        sender: "charlie@partner.org",
        subject: "Request for refund process clarification",
        body: "Could you clarify the steps involved in requesting a refund? I submitted the last week but have no update.",
        sent_date: "2025-08-22T09:58:00.000Z"
      },
      {
        sender: "diana@client.co",
        subject: "Query about product pricing",
        body: "Our servers are down, and we need immediate support. This is highly critical.",
        sent_date: "2025-08-22T09:58:00.000Z"
      },
      {
        sender: "bob@customer.com",
        subject: "Urgent: system access blocked",
        body: "This is urgent â our system is completely inaccessible, and this is affecting our operations.",
        sent_date: "2025-08-18T05:58:00.000Z"
      },
      {
        sender: "charlie@partner.org",
        subject: "Critical help needed for downtime",
        body: "There is a billing issue I was charged twice. This needs immediate correction.",
        sent_date: "2025-08-24T08:58:00.000Z"
      },
      {
        sender: "bob@customer.com",
        subject: "Query about product pricing",
        body: "There is a billing issue I was charged twice. This needs immediate correction.",
        sent_date: "2025-08-24T08:18:00.000Z"
      }
    ];
    
    const processedEmails = [];
    for (const emailData of sampleEmails) {
      const processedEmail = await processEmail(emailData);
      processedEmails.push(processedEmail);
    }
    
    return c.json({ 
      message: 'Sample data initialized successfully', 
      emails: processedEmails.length 
    });
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return c.json({ error: 'Failed to initialize sample data' }, 500);
  }
});

Deno.serve(app.fetch);