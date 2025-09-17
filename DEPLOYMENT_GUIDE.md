# 🚀 IdentityMaker Deployment Guide

Complete step-by-step guide to deploy your IdentityMaker application to production.

## 📋 Pre-Deployment Checklist

### ✅ **Application Requirements**
- [x] React application with Vite build system
- [x] Supabase backend configured
- [x] n8n webhooks for AI processing
- [x] Public form access working (no authentication required)
- [x] Environment variables configured
- [x] Production build tested

### ✅ **Deployment Requirements**
- [x] GitHub account
- [x] Vercel account (recommended) OR GitHub Pages
- [x] Domain name (optional)

## 🔧 Step 1: Create New Repository

### **Option A: GitHub Web Interface**
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Repository name: `identitymaker`
4. Description: "Advanced Identity Collision Assessment Platform"
5. Set to Public
6. Don't initialize with README (we have one)
7. Click "Create repository"

### **Option B: GitHub CLI**
```bash
gh repo create identitymaker --public --description "Advanced Identity Collision Assessment Platform"
```

## 📁 Step 2: Prepare and Upload Code

### **Clean and Prepare**
```bash
# Remove development files that shouldn't be deployed
rm -rf node_modules
rm -rf dist
rm -rf .git

# Remove development-specific files
rm -f bun.lockb
rm -f *.md (except README.md and DEPLOYMENT_GUIDE.md)
rm -f debug-*.md
rm -f test-*.html
rm -f *.png (except essential assets)
```

### **Initialize Git and Push**
```bash
# Initialize new git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: IdentityMaker v1.0.0"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/identitymaker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 3: Deploy to Vercel (Recommended)

### **Method 1: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `identitymaker` repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### **Method 2: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: identitymaker
# - Directory: ./
# - Want to override settings? No
```

### **Environment Variables in Vercel**
1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:
   ```
   VITE_SUPABASE_PROJECT_ID = jqdpxpdydikfcvmnraiq
   VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL = https://jqdpxpdydikfcvmnraiq.supabase.co
   ```
4. Redeploy the project

## 📄 Step 4: Deploy to GitHub Pages (Alternative)

### **Setup GitHub Pages**
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"homepage": "https://YOUR_USERNAME.github.io/identitymaker",
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### **Configure GitHub Pages**
1. Go to repository Settings
2. Scroll to "Pages"
3. Source: "Deploy from a branch"
4. Branch: `gh-pages`
5. Folder: `/ (root)`

## 🔧 Step 5: Configure Custom Domain (Optional)

### **For Vercel**
1. Go to project dashboard
2. Click "Settings" → "Domains"
3. Add your domain
4. Follow DNS configuration instructions

### **For GitHub Pages**
1. Add `CNAME` file to `public/` folder with your domain
2. Configure DNS with your domain provider
3. Enable HTTPS in repository settings

## ✅ Step 6: Test Deployment

### **Test These URLs**
- **Homepage**: `https://your-domain.com/`
- **Admin Login**: `https://your-domain.com/login`
- **Identity Collision Form**: `https://your-domain.com/identity-collision/5ac3cafd-72cd-40b0-99ee-1b4825906122`
- **Standard Form**: `https://your-domain.com/f/YOUR_FORM_ID`

### **Test These Features**
- [ ] Public form access (no login required)
- [ ] Form submission and n8n webhook processing
- [ ] AI report generation and display
- [ ] Admin dashboard access
- [ ] Mobile responsiveness
- [ ] Number slider functionality

## 🔒 Step 7: Security Configuration

### **Supabase Security**
1. Verify RLS policies are enabled
2. Check public form access policies
3. Ensure environment variables are secure

### **Domain Security**
1. Enable HTTPS
2. Configure CORS if needed
3. Set up proper headers

## 📊 Step 8: Monitoring and Analytics

### **Set up monitoring**
- Vercel Analytics (automatic)
- Google Analytics (optional)
- Supabase monitoring dashboard

## 🆘 Troubleshooting

### **Common Issues**

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variables Not Working**
- Check variable names (must start with VITE_)
- Verify values are correct
- Redeploy after changes

**Forms Not Loading**
- Check Supabase connection
- Verify RLS policies
- Check browser console for errors

**n8n Webhooks Not Working**
- Verify webhook URLs
- Check CORS configuration
- Test webhook endpoints manually

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables
3. Test locally first
4. Contact: lucas@automatrix-ia.com

---

**🎉 Congratulations! Your IdentityMaker application is now live!**
