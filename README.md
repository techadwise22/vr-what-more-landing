# VR What More - Landing Page

A sophisticated, ultra-luxurious landing page for "VR What More" with enterprise-grade security, comprehensive spam protection, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Ultra-Luxury Design**: Black and gold theme with premium animations
- **Two-Step Form**: Professional onboarding with progress tracking
- **Real-time Analytics**: Dynamic signup counter with Google Analytics
- **Responsive Design**: Mobile-first approach with touch-friendly UI

### 🔒 Enterprise Security Features
- **API Key Authentication**: Secure access control
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Input Validation & Sanitization**: XSS and injection protection
- **Spam Protection**: 
  - Bot detection and blocking
  - Honeypot fields
  - Content-based spam filtering
  - IP blocking and throttling
- **CAPTCHA Integration**: Google reCAPTCHA and custom challenges
- **CSRF Protection**: Cross-site request forgery prevention
- **Security Headers**: Comprehensive HTTP security headers
- **Request Logging**: Security monitoring and audit trails

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Security**: Custom middleware with industry best practices
- **Analytics**: Google Analytics 4
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel CLI
- Supabase account

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd vr-what-more-landing
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qyrroegdckqpquglsuru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Security Configuration
API_KEYS=vr-what-more-2024-secure-key,vr-what-more-backup-key-2024
CSRF_SECRET=vr-what-more-csrf-secret-2024-ultra-secure
CAPTCHA_TYPE=simple
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
BLOCKED_IPS=
LOG_LEVEL=info
NODE_ENV=production
```

### 3. Database Setup
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the schema from `supabase-schema.sql`

### 4. Local Development
```bash
npm run dev
```
Visit `http://localhost:3000`

### 5. Security Testing
```bash
npm run security:test
```

## 🔒 Security Implementation

### Authentication & Authorization
- **API Key Validation**: All API requests require valid API keys
- **Rate Limiting**: Configurable limits per IP address
- **Request Logging**: Comprehensive audit trails

### Input Protection
- **Validation Schema**: Strict input validation for all form fields
- **Sanitization**: Automatic HTML encoding and data cleaning
- **Length Limits**: Prevents oversized payloads
- **Pattern Matching**: Regex validation for specific formats

### Spam Prevention
- **Bot Detection**: User agent and behavior analysis
- **Honeypot Fields**: Hidden fields to catch automated submissions
- **Content Analysis**: Pattern matching for spam content
- **IP Blocking**: Automatic blocking of suspicious IPs
- **Time-based Limits**: Submission frequency controls

### CAPTCHA Integration
- **Google reCAPTCHA**: Enterprise-grade bot protection
- **Custom CAPTCHA**: Fallback simple challenges
- **Token-based**: Secure challenge/response system

### Security Headers
```javascript
// Comprehensive security headers
'X-Content-Type-Options': 'nosniff'
'X-Frame-Options': 'DENY'
'X-XSS-Protection': '1; mode=block'
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://qyrroegdckqpquglsuru.supabase.co;"
'Referrer-Policy': 'strict-origin-when-cross-origin'
'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
```

## 📡 API Endpoints

### Secure Form Submission
```
POST /api/submit-form-secure
Headers: 
  x-api-key: your_api_key
  Content-Type: application/json
```

### CAPTCHA Management
```
GET /api/captcha - Generate new challenge
POST /api/captcha - Validate answer
```

### Health Check
```
GET /api/health - System status
```

### Signup Count
```
GET /api/get-signup-count - Current signup statistics
```

## 🗄️ Database Schema

### Tables
- **basic_info**: Step 1 form data
- **professional_details**: Step 2 form data (linked)
- **signup_stats**: Analytics and counters

### Security Features
- **Row Level Security (RLS)**: Data access control
- **Indexes**: Performance optimization
- **Constraints**: Data integrity
- **Triggers**: Automatic timestamp updates

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Environment Variables
Set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `API_KEYS`
- `CSRF_SECRET`
- `RECAPTCHA_SECRET_KEY` (optional)
- `RECAPTCHA_SITE_KEY` (optional)

## 🔧 Configuration

### Security Settings
```javascript
// security-config.js
export const securityConfig = {
  rateLimiting: {
    default: { limit: 100, windowMs: 15 * 60 * 1000 },
    strict: { limit: 10, windowMs: 15 * 60 * 1000 }
  },
  captcha: {
    enabled: true,
    type: 'simple' // or 'recaptcha'
  },
  spamProtection: {
    enabled: true,
    maxSubmissionsPerMinute: 3
  }
};
```

### Customization
- **Rate Limits**: Adjust in `security-config.js`
- **Spam Patterns**: Modify in `api/middleware/spam-protection.js`
- **Validation Rules**: Update in `api/submit-form-secure.js`
- **Security Headers**: Configure in `vercel.json`

## 🧪 Testing

### Security Tests
```bash
npm run security:test
```

### Manual Testing
1. **Form Submission**: Test with valid/invalid data
2. **Rate Limiting**: Submit multiple requests quickly
3. **Spam Protection**: Try filling honeypot fields
4. **CAPTCHA**: Test challenge generation and validation
5. **API Keys**: Test with invalid/missing keys

### Load Testing
```bash
# Test rate limiting
for i in {1..20}; do curl -H "x-api-key: your_key" https://your-domain.vercel.app/api/submit-form-secure; done
```

## 📊 Monitoring

### Security Monitoring
- **Request Logs**: All API requests are logged
- **Spam Detection**: Suspicious activity alerts
- **Rate Limit Violations**: Abuse detection
- **Error Tracking**: Failed authentication attempts

### Analytics
- **Google Analytics**: User behavior tracking
- **Signup Counter**: Real-time statistics
- **Form Analytics**: Conversion tracking

## 🔐 Security Best Practices

### For Developers
1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Regular security audits** with `npm run security:audit`
4. **Keep dependencies updated**
5. **Monitor logs** for suspicious activity

### For Production
1. **Enable HTTPS** (automatic with Vercel)
2. **Set up monitoring** for security events
3. **Regular backups** of database
4. **Update API keys** periodically
5. **Monitor rate limits** and adjust as needed

## 🆘 Troubleshooting

### Common Issues
1. **API Key Errors**: Check environment variables
2. **Rate Limiting**: Increase limits in development
3. **CAPTCHA Issues**: Verify reCAPTCHA configuration
4. **Database Errors**: Check Supabase connection

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

## 📞 Support

For technical support or security concerns:
- **Email**: info@vijayraja.com
- **Documentation**: Check this README
- **Issues**: Create GitHub issue

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ by Vijay Raja | Powered by WMG** 