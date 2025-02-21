# Deployment Guide

## Prerequisites

Before deploying, ensure you have:
1. Node.js 18+ installed
2. PostgreSQL database setup
3. OpenAI API key
4. Git repository setup
5. Production environment variables configured

## Deployment Options

### 1. Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add required variables:
     ```
     OPENAI_API_KEY=your_api_key
     DATABASE_URL=your_production_db_url
     ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### 2. Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Create Docker Compose**
   ```yaml
   version: '3.8'
   services:
     web:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://user:pass@db:5432/cro_box
         - OPENAI_API_KEY=your_api_key
     db:
       image: postgres:14
       environment:
         - POSTGRES_USER=user
         - POSTGRES_PASSWORD=pass
         - POSTGRES_DB=cro_box
   ```

3. **Build and Run**
   ```bash
   docker-compose up -d
   ```

### 3. Traditional VPS Deployment

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   npm install -g pm2
   ```

2. **Clone and Build**
   ```bash
   git clone your-repository
   cd cro-box
   npm install
   npm run build
   ```

3. **Configure PM2**
   ```bash
   # ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'cro-box',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         DATABASE_URL: 'your_db_url',
         OPENAI_API_KEY: 'your_api_key'
       }
     }]
   }
   ```

4. **Start Application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

## Database Migration

### Production Database Setup

1. **Create Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Apply Migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify Database**
   ```bash
   npx prisma studio
   ```

## SSL Configuration

### Using Nginx as Reverse Proxy

1. **Install Nginx**
   ```bash
   sudo apt install nginx
   ```

2. **Configure Nginx**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

3. **Setup SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Monitoring and Logging

### Setup Application Monitoring

1. **Install Monitoring Tools**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```

2. **Configure Bundle Analysis**
   ```js
   // next.config.js
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true'
   });
   ```

3. **Setup Error Tracking**
   ```bash
   npm install --save @sentry/nextjs
   ```

### Logging Configuration

1. **Setup Winston Logger**
   ```typescript
   import winston from 'winston';

   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

## Performance Optimization

### Production Optimizations

1. **Enable Compression**
   ```js
   // next.config.js
   module.exports = {
     compress: true
   }
   ```

2. **Configure Caching**
   ```typescript
   export async function getStaticProps() {
     return {
       props: {
         data: yourData
       },
       revalidate: 60 // Revalidate every minute
     }
   }
   ```

3. **Optimize Images**
   ```typescript
   import Image from 'next/image'

   export default function OptimizedImage() {
     return (
       <Image
         src="/your-image.jpg"
         alt="Description"
         width={800}
         height={600}
         priority
       />
     )
   }
   ```

## Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Test database connection
   npx prisma db push --preview-feature
   ```

2. **Build Failures**
   ```bash
   # Clear cache and node_modules
   rm -rf .next node_modules
   npm install
   ```

3. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max_old_space_size=4096"
   ```

## Backup Strategy

### Database Backup

1. **Setup Automated Backups**
   ```bash
   # Create backup script
   pg_dump -U user -d cro_box > backup.sql
   ```

2. **Schedule Backups**
   ```bash
   # Add to crontab
   0 0 * * * /path/to/backup-script.sh
   ```

## Security Considerations

1. **Enable Security Headers**
   ```js
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/:path*',
           headers: [
             {
               key: 'X-Frame-Options',
               value: 'DENY'
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff'
             }
           ]
         }
       ]
     }
   }
   ```

2. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit'

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ``` 