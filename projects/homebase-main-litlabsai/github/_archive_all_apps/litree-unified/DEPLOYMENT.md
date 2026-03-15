# LiTree Unified - Deployment Guide

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended - Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

**Advantages:**

- Zero config for Next.js
- Automatic HTTPS
- Global CDN
- Free tier available

### 2. Firebase Hosting

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
npm run deploy
```

### 3. Docker

```bash
# Build image
docker build -t litree .

# Run container
docker run -p 3000:3000 litree

# Docker Compose
docker-compose up
```

### 4. Azure Static Web Apps

```bash
# Install Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Deploy
az staticwebapp create \
  --name litree \
  --resource-group myResourceGroup \
  --source .
```

## 🔧 Environment Variables

Set these in your deployment platform:

### Required

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_APP_URL`

### Optional (for full features)

- `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_INFURA_ID`
- `PAYPAL_CLIENT_SECRET`

## 📊 Pre-Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm start`
- [ ] Set all environment variables
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate
- [ ] Configure CDN (if not using Vercel)
- [ ] Set up monitoring/analytics
- [ ] Test payment integrations in production mode
- [ ] Verify API endpoints work
- [ ] Test on mobile devices

## 🔐 Security Checklist

- [ ] All API keys in environment variables (not in code)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Database rules/permissions set
- [ ] Backup strategy in place

## 📈 Post-Deployment

1. **Monitor Performance**
   - Set up Vercel Analytics or Google Analytics
   - Monitor API response times
   - Track error rates

2. **SEO Setup**
   - Submit sitemap to Google Search Console
   - Configure meta tags
   - Set up social media cards

3. **User Feedback**
   - Set up feedback form
   - Monitor user reports
   - Track feature usage

## 🆘 Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Clear `.next` folder and rebuild
- Verify all dependencies installed

### Environment Variables Not Working

- Prefix with `NEXT_PUBLIC_` for client-side
- Restart dev server after changes
- Check deployment platform docs

### 404 Errors

- Verify file structure matches routes
- Check `next.config.js` settings
- Clear cache and rebuild

## 📞 Support

Need help? Contact support@litree.io

---

**Happy Deploying! 🚀**
