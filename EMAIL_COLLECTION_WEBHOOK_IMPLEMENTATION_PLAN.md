# Email Collection Webhook Implementation Plan

**🎯 Objective**: Add webhook call when user enters email on the first page of Identity Collision Assessment without affecting existing functionality.

---

## **📋 Current Flow Analysis**

### **Existing Flow:**
```
1. User visits: /identity-collision/:formId
2. User enters email → handleEmailSubmit() → setStep('form')
3. User completes assessment → handleFormSubmit() → webhook call to n8n
4. AI processing → Report generation
```

### **Proposed Enhanced Flow:**
```
1. User visits: /identity-collision/:formId
2. User enters email → handleEmailSubmit() → 
   ├── NEW: Email collection webhook call
   └── setStep('form')
3. User completes assessment → handleFormSubmit() → existing webhook call
4. AI processing → Report generation
```

---

## **🧪 Test Page Created**

### **Access the Test Page:**
```
Local: http://localhost:8081/webhook-test
Ngrok: https://31fc10bc1196.ngrok-free.app/webhook-test
```

### **Test Page Features:**
- ✅ **Email Collection Webhook Test** - Simulates the new webhook call
- ✅ **Form Submission Webhook Test** - Tests existing webhook functionality
- ✅ **Custom Webhook URL** - Test with different endpoints
- ✅ **Response Monitoring** - View webhook responses in real-time
- ✅ **Data Structure Validation** - Ensures correct payload format

### **Test Data Structure:**
```typescript
// Email Collection Webhook Payload
{
  formId: "5ac3cafd-72cd-40b0-99ee-1b4825906122",
  formTitle: "Identity Collision Assessment",
  userEmail: "test@example.com",
  submissionId: "uuid-generated",
  submissionTimestamp: "2025-01-20T...",
  eventType: "email_collected",
  metadata: {
    totalQuestions: 0,
    submissionSource: "identity_collision_form",
    userAgent: "Mozilla/5.0..."
  }
}
```

---

## **🔧 Implementation Plan**

### **Phase 1: Webhook Configuration (Day 1)**

#### **1.1 Create Environment Variables**
```typescript
// Add to .env files
VITE_N8N_EMAIL_WEBHOOK_URL=https://purposewaze.app.n8n.cloud/webhook/emailCollection
VITE_N8N_FORM_WEBHOOK_URL=https://purposewaze.app.n8n.cloud/webhook/identityColision

// Or use single endpoint with eventType differentiation
VITE_N8N_WEBHOOK_BASE_URL=https://purposewaze.app.n8n.cloud/webhook
```

#### **1.2 Create Webhook Service**
```typescript
// src/services/webhookService.ts
interface WebhookPayload {
  formId: string;
  formTitle: string;
  userEmail: string;
  submissionId: string;
  submissionTimestamp: string;
  eventType: 'email_collected' | 'form_submitted';
  formResponses?: Record<string, string>;
  metadata: {
    totalQuestions: number;
    submissionSource: string;
    userAgent: string;
  };
}

export const sendWebhook = async (
  payload: WebhookPayload,
  endpoint: 'email' | 'form'
): Promise<any> => {
  const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL;
  const webhookUrl = endpoint === 'email' 
    ? `${baseUrl}/emailCollection`
    : `${baseUrl}/identityColision`;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }

  return response.json();
};
```

### **Phase 2: Email Collection Integration (Day 1-2)**

#### **2.1 Modify handleEmailSubmit Function**
```typescript
// In src/pages/IdentityCollisionForm.tsx
import { sendWebhook } from '@/services/webhookService';

const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!userEmail.trim()) {
    toast({
      title: "Email Required",
      description: "Please enter your email address.",
      variant: "destructive"
    });
    return;
  }

  // NEW: Send email collection webhook
  try {
    const emailWebhookData = {
      formId: formId!,
      formTitle: formData?.title || 'Identity Collision Assessment',
      userEmail,
      submissionId: crypto.randomUUID(),
      submissionTimestamp: new Date().toISOString(),
      eventType: 'email_collected' as const,
      metadata: {
        totalQuestions: 0,
        submissionSource: 'identity_collision_form',
        userAgent: navigator.userAgent
      }
    };

    // Send webhook but don't block user flow
    sendWebhook(emailWebhookData, 'email').catch(error => {
      console.warn('Email webhook failed (non-blocking):', error);
      // Optional: Send to error tracking service
    });

    console.log('📧 Email collection webhook sent:', emailWebhookData);
    
  } catch (error) {
    // Log error but don't block user flow
    console.warn('Email webhook error (non-blocking):', error);
  }

  // Continue with existing flow
  setStep('form');
};
```

#### **2.2 Error Handling Strategy**
```typescript
// Non-blocking webhook implementation
const sendEmailWebhookSafely = async (webhookData: WebhookPayload) => {
  try {
    await sendWebhook(webhookData, 'email');
    console.log('✅ Email webhook sent successfully');
  } catch (error) {
    console.warn('⚠️ Email webhook failed (non-blocking):', error);
    
    // Optional: Store failed webhooks for retry
    const failedWebhook = {
      ...webhookData,
      failedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    // Store in localStorage for potential retry
    const failedWebhooks = JSON.parse(
      localStorage.getItem('failedWebhooks') || '[]'
    );
    failedWebhooks.push(failedWebhook);
    localStorage.setItem('failedWebhooks', JSON.stringify(failedWebhooks));
  }
};
```

### **Phase 3: Testing & Validation (Day 2)**

#### **3.1 Test Scenarios**
```typescript
// Test cases to validate
const testScenarios = [
  {
    name: 'Email Collection Success',
    test: 'Enter email → verify webhook sent → proceed to form',
    expected: 'Webhook sent, form loads normally'
  },
  {
    name: 'Email Collection Webhook Failure',
    test: 'Enter email with webhook endpoint down',
    expected: 'Form still loads, error logged but not shown to user'
  },
  {
    name: 'Form Submission Success',
    test: 'Complete assessment → verify both webhooks sent',
    expected: 'Both email and form webhooks in n8n logs'
  },
  {
    name: 'Existing Functionality Preserved',
    test: 'Complete full flow without email webhook',
    expected: 'Assessment works exactly as before'
  }
];
```

#### **3.2 Validation Checklist**
- [ ] Email webhook sends correct payload structure
- [ ] Form submission webhook unchanged
- [ ] User flow not interrupted by webhook failures
- [ ] No performance impact on form loading
- [ ] Error handling doesn't expose sensitive information
- [ ] Webhook failures logged for debugging

### **Phase 4: n8n Workflow Configuration (Day 2-3)**

#### **4.1 n8n Workflow Setup**
```javascript
// n8n Email Collection Workflow
{
  "nodes": [
    {
      "name": "Email Collection Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "emailCollection",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Validate Email Data",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": `
          const { userEmail, formId, eventType } = $json;
          
          if (eventType !== 'email_collected') {
            throw new Error('Invalid event type');
          }
          
          if (!userEmail || !formId) {
            throw new Error('Missing required fields');
          }
          
          return $json;
        `
      }
    },
    {
      "name": "Add to Email List",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members",
        "method": "POST",
        "body": {
          "email_address": "={{$json.userEmail}}",
          "status": "subscribed",
          "tags": ["identity-assessment", "lead-magnet"]
        }
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "to": "={{$json.userEmail}}",
        "subject": "Welcome! Your Identity Assessment is Starting...",
        "text": "Thank you for starting your Identity Collision Assessment..."
      }
    }
  ]
}
```

#### **4.2 Email Automation Sequence**
```
Email Collection → Immediate Actions:
├── Add to CRM/Email list
├── Send welcome email
├── Tag as "assessment-started"
├── Start nurture sequence
└── Track conversion funnel

Form Completion → Follow-up Actions:
├── Update contact status
├── Send assessment results
├── Tag as "assessment-completed"
├── Trigger sales sequence
└── Generate AI report
```

---

## **🚀 Implementation Steps**

### **Step 1: Test Current Setup**
```bash
# 1. Access test page
http://localhost:8081/webhook-test

# 2. Test email collection webhook
- Enter test email
- Click "Test Email Collection Webhook"
- Verify response in n8n

# 3. Test form submission webhook  
- Click "Test Form Submission Webhook"
- Verify existing functionality works
```

### **Step 2: Create Webhook Service**
```bash
# Create the webhook service file
touch src/services/webhookService.ts

# Add environment variables
echo "VITE_N8N_WEBHOOK_BASE_URL=https://purposewaze.app.n8n.cloud/webhook" >> .env
```

### **Step 3: Modify IdentityCollisionForm**
```typescript
// Import webhook service
import { sendWebhook } from '@/services/webhookService';

// Modify handleEmailSubmit to include webhook call
// (See detailed implementation in Phase 2.1 above)
```

### **Step 4: Test Integration**
```bash
# 1. Test email collection
- Enter email on form
- Check browser console for webhook logs
- Verify n8n receives webhook

# 2. Test complete flow
- Complete full assessment
- Verify both webhooks sent
- Confirm existing functionality preserved
```

### **Step 5: Deploy & Monitor**
```bash
# 1. Deploy to staging
npm run build
# Deploy to Vercel/Netlify

# 2. Monitor webhook success rates
# 3. Set up error alerting
# 4. Track email collection metrics
```

---

## **⚠️ Risk Mitigation**

### **Zero-Impact Implementation**
- ✅ **Non-blocking webhooks** - Failures don't affect user experience
- ✅ **Graceful degradation** - Form works even if webhook service is down
- ✅ **Backward compatibility** - Existing form submission webhook unchanged
- ✅ **Error isolation** - Email webhook errors don't affect assessment flow

### **Rollback Plan**
```typescript
// Feature flag for easy rollback
const ENABLE_EMAIL_WEBHOOK = import.meta.env.VITE_ENABLE_EMAIL_WEBHOOK === 'true';

const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation logic...
  
  // Conditional webhook call
  if (ENABLE_EMAIL_WEBHOOK) {
    sendEmailWebhookSafely(emailWebhookData);
  }
  
  setStep('form');
};
```

### **Monitoring & Alerts**
```typescript
// Webhook success tracking
const trackWebhookMetrics = {
  emailWebhookSuccessRate: 'Track via n8n logs',
  emailWebhookFailureRate: 'Alert if >5% failure rate',
  formSubmissionImpact: 'Monitor conversion rates',
  performanceImpact: 'Track page load times'
};
```

---

## **📊 Success Metrics**

### **Technical Metrics**
- ✅ Email webhook success rate >95%
- ✅ Form submission flow unchanged
- ✅ Page load time impact <100ms
- ✅ Zero user-facing errors

### **Business Metrics**
- ✅ Email collection rate (baseline measurement)
- ✅ Email engagement rates
- ✅ Assessment completion rates
- ✅ Lead nurturing effectiveness

---

## **🎯 Next Steps**

1. **Test the webhook test page** at `/webhook-test`
2. **Configure n8n email collection endpoint**
3. **Implement webhook service** (1-2 hours)
4. **Modify email submit handler** (1 hour)
5. **Test thoroughly** (2-3 hours)
6. **Deploy and monitor** (ongoing)

**Total Implementation Time: 1-2 days**

---

**Questions for Clarification:**

1. **n8n Endpoint**: Should I use a new endpoint `/emailCollection` or modify the existing `/identityColision` to handle both event types?

2. **Email Actions**: What specific actions should the email collection webhook trigger? (Add to mailing list, send welcome email, start nurture sequence?)

3. **Error Handling**: How should we handle webhook failures? Silent logging or user notification?

4. **Testing**: Do you want to test with the existing n8n endpoint first, or should I help you set up a test endpoint?

Ready to proceed with implementation once you confirm the approach! 🚀
