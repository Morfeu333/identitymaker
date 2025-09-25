# 🚀 IdentityMaker Vercel Deployment Guide

**Complete Step-by-Step Guide for Production Deployment**

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### ✅ **Repository Status**
- [x] Latest code pushed to GitHub: `https://github.com/Morfeu333/identitymaker.git`
- [x] Name field + webhook integration implemented
- [x] All functionalities tested locally
- [x] Ready for production deployment

### ✅ **Required Accounts & Services**
- [x] **GitHub Account**: Repository access
- [x] **Vercel Account**: For deployment platform
- [x] **Supabase Account**: Database & authentication
- [x] **n8n Account**: Webhook endpoints
- [x] **LeadConnector Account**: Lead capture webhooks

---

## 🎯 **STEP 1: VERCEL ACCOUNT SETUP**

### **1.1 Create Vercel Account**
1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub repositories
5. Complete account setup

### **1.2 Install Vercel CLI (Optional)**
```bash
npm install -g vercel
vercel login
```

---

## 🔗 **STEP 2: CONNECT GITHUB REPOSITORY**

### **2.1 Import Project**
1. **Login to Vercel Dashboard**: https://vercel.com/dashboard
2. Click **"New Project"**
3. **Import Git Repository**:
   - Select **GitHub**
   - Find **"Morfeu333/identitymaker"**
   - Click **"Import"**

### **2.2 Configure Project Settings**
```yaml
Project Name: identitymaker
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

---

## ⚙️ **STEP 3: ENVIRONMENT VARIABLES SETUP**

### **3.1 Add Environment Variables in Vercel**
1. In Vercel project dashboard
2. Go to **"Settings"** → **"Environment Variables"**
3. Add the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=jqdpxpdydikfcvmnraiq
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZHB4cGR5ZGlrZmN2bW5yYWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1Njc5NzUsImV4cCI6MjA3MzE0Mzk3NX0.gvDrLpxoXezLAKn_4S_bDinAmMQrASqp89fyP0dGAr0
VITE_SUPABASE_URL=https://jqdpxpdydikfcvmnraiq.supabase.co

# Production Environment
NODE_ENV=production
```

### **3.2 Environment Variable Settings**
- **Environment**: Production, Preview, Development
- **Type**: Plain Text (for all variables)
- **Sensitive**: Check for API keys

---

## 🏗️ **STEP 4: BUILD CONFIGURATION**

### **4.1 Verify Build Settings**
```json
// package.json - Verify these scripts exist
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### **4.2 Vercel Configuration File**
Create `vercel.json` in project root:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🚀 **STEP 5: DEPLOY TO VERCEL**

### **5.1 Initial Deployment**
1. **Click "Deploy"** in Vercel dashboard
2. **Wait for build process** (2-5 minutes)
3. **Monitor build logs** for any errors
4. **Get deployment URL** (e.g., `https://identitymaker-xyz.vercel.app`)

### **5.2 Verify Deployment**
✅ **Check these URLs work:**
- `https://your-app.vercel.app/` - Homepage
- `https://your-app.vercel.app/identity-collision/5ac3cafd-72cd-40b0-99ee-1b4825906122` - Assessment form

---

## 🔧 **STEP 6: CONFIGURE CUSTOM DOMAIN (Optional)**

### **6.1 Add Custom Domain**
1. Go to **"Settings"** → **"Domains"**
2. Add your domain (e.g., `identitymaker.com`)
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

### **6.2 DNS Configuration**
```bash
# Add these DNS records to your domain provider:
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

---

## 📱 **STEP 7: EMBEDDING SETUP**

### **7.1 Identity Collision Form Embed**
**Direct Embed URL:**
```html
<iframe 
  src="https://your-app.vercel.app/identity-collision/5ac3cafd-72cd-40b0-99ee-1b4825906122"
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</iframe>
```

### **7.2 Responsive Embed Code**
```html
<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%;">
  <iframe 
    src="https://your-app.vercel.app/identity-collision/5ac3cafd-72cd-40b0-99ee-1b4825906122"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;">
  </iframe>
</div>
```

---

## 🧪 **STEP 8: TESTING CHECKLIST**

### **8.1 Functionality Tests**
- [ ] **Homepage loads** correctly
- [ ] **Identity Collision Assessment** accessible
- [ ] **Name field** appears above email
- [ ] **Email collection webhook** fires to LeadConnector
- [ ] **Assessment questions** work properly
- [ ] **Report generation** functions
- [ ] **"START MY 30 DAYS PLAN" button** triggers webhook and redirects
- [ ] **All webhooks** appear in respective dashboards

### **8.2 Performance Tests**
- [ ] **Page load speed** < 3 seconds
- [ ] **Mobile responsiveness** works
- [ ] **Cross-browser compatibility** (Chrome, Firefox, Safari)
- [ ] **SSL certificate** active (https://)

---

## 🔍 **STEP 9: MONITORING & MAINTENANCE**

### **9.1 Vercel Analytics**
1. Enable **Vercel Analytics** in project settings
2. Monitor **page views**, **performance**, **errors**
3. Set up **alerts** for downtime

### **9.2 Webhook Monitoring**
- **LeadConnector**: Monitor email collection webhooks
- **n8n Dashboard**: Track assessment and button click webhooks
- **Browser Console**: Check for JavaScript errors

---

## 🚨 **TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

#### **Build Failures**
```bash
# Error: "Module not found"
Solution: Check package.json dependencies
Command: npm install

# Error: "TypeScript errors"
Solution: Fix type errors or add // @ts-ignore
```

#### **Environment Variables Not Working**
```bash
# Check: Variables are set in Vercel dashboard
# Check: Variables start with VITE_ for client-side access
# Solution: Redeploy after adding variables
```

#### **Webhooks Not Firing**
```bash
# Check: Network tab in browser developer tools
# Check: Console logs for webhook errors
# Check: Webhook URLs are accessible
```

#### **Supabase Connection Issues**
```bash
# Check: Environment variables are correct
# Check: Supabase project is active
# Check: RLS policies allow access
```

---

## 📞 **SUPPORT & RESOURCES**

### **Documentation Links**
- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **Supabase Docs**: https://supabase.com/docs
- **React Router**: https://reactrouter.com/

### **Emergency Contacts**
- **Vercel Support**: https://vercel.com/help
- **GitHub Issues**: https://github.com/Morfeu333/identitymaker/issues

---

## ✅ **DEPLOYMENT SUCCESS CHECKLIST**

- [ ] **Vercel project** created and connected
- [ ] **Environment variables** configured
- [ ] **Build successful** without errors
- [ ] **Custom domain** configured (if applicable)
- [ ] **All functionalities** tested and working
- [ ] **Webhooks** firing correctly
- [ ] **Embed code** ready for distribution
- [ ] **Monitoring** set up
- [ ] **Documentation** updated

---

## 🎯 **NEXT STEPS AFTER DEPLOYMENT**

1. **Test embed** on target websites
2. **Monitor webhook** success rates
3. **Collect user feedback**
4. **Plan security improvements** (Phase 1 from earlier discussion)
5. **Scale infrastructure** as needed

---

**🚀 Your IdentityMaker application is now ready for production deployment on Vercel!**

**Deployment URL will be**: `https://identitymaker-[random].vercel.app`
**Embed URL will be**: `https://identitymaker-[random].vercel.app/identity-collision/5ac3cafd-72cd-40b0-99ee-1b4825906122`
