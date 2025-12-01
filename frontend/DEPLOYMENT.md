# Deployment Guide

This guide covers deploying the Enterprise Chat Frontend to various platforms.

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# This creates an optimized `dist` folder ready for deployment
```

## 🚀 Deployment Platforms

### 1. Vercel (Recommended)

**Easiest deployment - takes 2 minutes**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# VITE_API_BASE_URL = https://your-api.com/api
# VITE_SOCKET_URL = https://your-api.com
```

**Via GitHub:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically on push

### 2. Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Or connect to GitHub for auto-deploy
```

### 3. AWS Amplify

```bash
# Install AWS Amplify CLI
npm i -g @aws-amplify/cli

# Configure
amplify configure

# Initialize
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### 4. GitHub Pages

```bash
# Add to package.json
"homepage": "https://username.github.io/repo-name"

# Build
npm run build

# Deploy to gh-pages branch
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

npm run deploy
```

### 5. Docker & Self-Hosted

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000

ENV NODE_ENV=production
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### Build and run Docker image

```bash
# Build
docker build -t enterprise-chat-frontend .

# Run
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=http://api.example.com/api \
  -e VITE_SOCKET_URL=http://api.example.com \
  enterprise-chat-frontend
```

#### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://api.example.com/api
      VITE_SOCKET_URL: http://api.example.com
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: mongodb://mongo:27017/chat
      NODE_ENV: production
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 6. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name chat.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name chat.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API (if on same server)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🌍 Environment Configuration

### Production Environment Variables

```env
# Production API endpoints
VITE_API_BASE_URL=https://api.example.com/api
VITE_SOCKET_URL=https://api.example.com

# App info
VITE_APP_NAME=Enterprise Chat
VITE_APP_VERSION=1.0.0
```

### Staging Environment Variables

```env
VITE_API_BASE_URL=https://staging-api.example.com/api
VITE_SOCKET_URL=https://staging-api.example.com
```

## ✅ Pre-Deployment Checklist

- [ ] Run `npm run build` without errors
- [ ] Run `npm run lint` - no errors
- [ ] Test in production mode: `npm run preview`
- [ ] Verify environment variables are set
- [ ] Test all authentication flows
- [ ] Test message sending/receiving
- [ ] Test channel operations
- [ ] Test on mobile devices
- [ ] Check dark mode functionality
- [ ] Verify images/assets load correctly
- [ ] Test error handling
- [ ] Check console for warnings/errors
- [ ] Verify analytics are configured
- [ ] Test API connectivity from production domain

## 🔒 Security Headers

Add these headers for production:

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
Referrer-Policy: strict-origin-when-cross-origin
```

## 📊 Performance Optimization

### Bundle Analysis

```bash
# Install analyzer
npm install --save-dev rollup-plugin-visualizer

# Build with visualization
npm run build

# View dist/stats.html
```

### Common Optimizations

1. **Code Splitting** - Already configured in vite.config.ts
2. **Lazy Loading** - Wrap page components with React.lazy()
3. **Image Optimization** - Use WebP format
4. **Minification** - Automatic in production build
5. **Gzip Compression** - Configure in web server

### Lazy Loading Example

```typescript
import { lazy, Suspense } from 'react';

const ChatPage = lazy(() => import('./pages/ChatPage'));

// In routes
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/chat" element={<ChatPage />} />
</Suspense>
```

## 🚨 Error Monitoring

### Sentry Integration

```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## 📈 Analytics

### Google Analytics

```typescript
// Add to main.tsx
import { useEffect } from 'react';

export const useGoogleAnalytics = () => {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args) {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  }, []);
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🐛 Post-Deployment Monitoring

1. **Check Analytics** - Verify traffic is coming through
2. **Monitor Errors** - Set up error alerts
3. **Performance** - Use Lighthouse CI
4. **Uptime** - Set up uptime monitoring
5. **CDN** - Verify assets are cached properly

## 🆘 Troubleshooting

### "Cannot find module" after deploy
- Clear build cache
- Reinstall dependencies: `npm ci`
- Rebuild: `npm run build`

### "API connection failed"
- Verify VITE_API_BASE_URL is correct
- Check CORS configuration on backend
- Verify backend is accessible from production domain

### "WebSocket connection failed"
- Check VITE_SOCKET_URL configuration
- Verify WebSocket is not blocked by firewall
- Check backend Socket.io configuration

### "White screen after deploy"
- Check browser console for errors
- Verify index.html is being served
- Check environment variables are set

---

**Happy deploying! 🚀**
