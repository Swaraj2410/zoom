# 🔐 HTTPS/TLS Configuration Guide

This guide explains how to set up HTTPS/TLS for your application.

## Overview

HTTPS encrypts all communication between client and server, providing:
- **Confidentiality**: Data cannot be intercepted
- **Integrity**: Data cannot be modified in transit
- **Authentication**: Server identity verification

## Setup Steps

### 1. **Generate Self-Signed Certificate (Development)**

For local development, generate a self-signed certificate:

```bash
# Create certs directory
mkdir backend/certs

# Generate private key and certificate (valid for 365 days)
openssl req -x509 -newkey rsa:4096 -keyout backend/certs/private.key -out backend/certs/certificate.crt -days 365 -nodes

# When prompted, you can fill in the details or press Enter for defaults
# For CN (Common Name), use: localhost (for development)
```

### 2. **Production Certificates**

For production, obtain a real SSL/TLS certificate from a Certificate Authority (CA):

**Options:**
- **Let's Encrypt** (Free): https://letsencrypt.org
- **AWS Certificate Manager** (Free within AWS): https://aws.amazon.com/certificate-manager/
- **Paid CAs**: Comodo, GlobalSign, DigiCert, etc.

**Process:**
1. Create a Certificate Signing Request (CSR)
2. Submit to CA
3. CA validates and issues certificate
4. Place certificate files in `backend/certs/`

### 3. **Update Application**

The app.js file should use the HTTPS configuration:

```javascript
import { createSecureServer } from "./utils/https.js";

const ssl = createSecureServer(app, {
    port: process.env.PORT || 8000
});
```

### 4. **Environment Variables**

Add to your `.env` file:

```
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
port=8443  # Standard HTTPS port
```

## Security Best Practices

### ✅ Do's:
- Use HTTPS in production
- Keep certificates up to date
- Use TLS 1.2 or higher
- Enable HSTS (HTTP Strict Transport Security)
- Rotate certificates before expiration
- Use strong cipher suites

### ❌ Don't's:
- Don't use self-signed certificates in production
- Don't expose private keys in version control
- Don't disable certificate validation
- Don't use older TLS versions (< 1.2)
- Don't share certificates across environments

## HSTS Header Configuration

Add to middleware in app.js:

```javascript
app.use(helmet());  // Already includes HSTS headers
// Helmet sets: Strict-Transport-Security: max-age=15768000; includeSubDomains
```

## Testing HTTPS Locally

### Browser Testing:
```bash
npm start
# Open https://localhost:8443 in browser
# Accept the self-signed certificate warning
```

### cURL Testing:
```bash
# Ignore self-signed certificate warning
curl -k https://localhost:8443/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Node.js Testing:
```javascript
import https from 'https';

const options = {
    hostname: 'localhost',
    port: 8443,
    path: '/api/v1/users/login',
    method: 'POST',
    rejectUnauthorized: false  // Only for development!
};

const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
});
```

## Deployment on Platforms

### Heroku/Render/Railway:
These platforms handle SSL/TLS automatically with free certificates.

### AWS:
- Use AWS Certificate Manager (free)
- Attach to Application Load Balancer
- Configure app to run on HTTP (ALB handles HTTPS)

### Docker:
Include certificate files in your container:
```dockerfile
COPY certs/certificate.crt /app/certs/
COPY certs/private.key /app/certs/
```

## Certificate Renewal

Self-signed certificates expire eventually. Renew when needed:

```bash
# Check expiration date
openssl x509 -enddate -noout -in backend/certs/certificate.crt

# Generate new certificate
openssl req -x509 -newkey rsa:4096 -keyout backend/certs/private.key \
  -out backend/certs/certificate.crt -days 365 -nodes
```

## Monitoring & Alerts

Monitor certificate expiration dates:
- Set calendar reminders 30-60 days before expiration
- Use monitoring tools like SSL Labs (https://www.ssllabs.com/ssltest/)
- Monitor logs for SSL/TLS errors

## Troubleshooting

### Problem: "self signed certificate"
**Solution**: This is normal for development. For production, use a real certificate.

### Problem: "certificate verify failed"
**Solution**: 
- Check certificate path
- Ensure certificate.crt and private.key are in `/backend/certs/`
- Verify file permissions

### Problem: "Mixed Content" warning
**Solution**: Ensure both frontend and API use HTTPS.

### Problem: Port already in use
**Solution**:
```bash
# Find process using port
lsof -i :8443
# Kill process
kill -9 <PID>
```

## Security Rating

After deployment, test your SSL/TLS configuration:
- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **Mozilla Observatory**: https://observatory.mozilla.org/
- **Qualys**: https://www.qualys.com/

Aim for an "A" rating for production deployments.

## References

- [MDN: HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/https)
- [OWASP: Transport Layer Protection](https://owasp.org/www-community/attacks/Manipulator-in-the-middle_attack)
- [Node.js HTTPS Documentation](https://nodejs.org/api/https.html)
- [Let's Encrypt](https://letsencrypt.org/)
