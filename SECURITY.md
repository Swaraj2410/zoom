# Project Security Guidelines

This project has been enhanced with security best practices for the backend and documentation.

## What was added
- `helmet` for secure HTTP headers
- `express-rate-limit` to reduce brute-force and abuse attempts
- token-based authentication middleware for protected routes
- Socket.IO handshake authentication for secure real-time connections
- backend proxy trust configuration for correct rate limiting behind proxies
- stricter CORS configuration limited to the frontend origin
- `.env.example` and `.gitignore` to keep secrets out of source control
- Axios request interceptor to send authentication tokens in `Authorization` headers
- `SECURITY_TERMS.md` for detailed cybersecurity terminology and best practices
- MySQL connection pooling with secure credentials stored in environment variables
- SQL parameterization to reduce injection risk

## Syllabus-aligned security topics

### Information Security
- **Confidentiality, Integrity, Availability (CIA)** are the core goals of this app.
  - Confidentiality: login and token protection
  - Integrity: hashed passwords and parameterized queries
  - Availability: rate limiting and request protection
- **Risk Management**: secure defaults, limited CORS, environment-based secrets, and vulnerability auditing.
- **Cryptography & Hashing**: bcrypt password hashing and random token generation.
- **Certificates and TLS**: production deployment must use HTTPS/TLS.

### Network Security
- **Authentication and Authorization**: token middleware enforces access control.
- **Transport Layer Security (TLS/HTTPS)**: recommended for all deployments.
- **Application Security**: secure coding via request validation, error handling, and secure headers.

### Cloud Security
- **Cloud risk management**: use secret storage, isolated backend, and secure deployment practices.
- **Cloud security measures**: secure configuration, restricted network access, and encrypted communication.
- **Cloud solutions**: use managed databases, secret vaults, and HTTPS endpoints.

### Cyber Attacks and Penetration Testing
- **Common attacks**: brute force, injection, XSS, CSRF, and credential reuse are considered.
- **Penetration testing**: this app is structured so penetration testing can focus on login, token auth, socket events, and API endpoints.
- **Vulnerability mitigation**: parameterized SQL queries, auth checks, request size limits, and safe headers.

### AI in Cybersecurity
- Documented best practice: AI can assist with security monitoring, anomaly detection, and code scanning, even if not implemented here.

## How this project maps to the syllabus

- `backend/src/app.js` implements secure headers, rate limiting, and CORS control.
- `backend/src/middleware/auth.middleware.js` implements authentication and authorization.
- `backend/src/controllers/user.controller.js` implements password hashing and token management.
- `backend/src/models/*.js` uses parameterized queries to prevent SQL injection.
- `SECURITY_TERMS.md` and `SECURITY.md` now capture syllabus concepts such as CIA, TLS, pen testing, and cloud security.

## Recommended project security setup

1. Create a `.env` file in the project root and set:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `PORT`
   - `FRONTEND_URL`

2. Do not commit `.env` to source control.
3. Run the backend over HTTPS in production.
4. Keep dependencies up to date and run `npm audit` regularly.
5. Keep sensitive credentials out of code.
6. Use secure cookies and browser storage policies for any auth tokens.

## Production hardening checklist

- Serve both frontend and backend over HTTPS
- Restrict CORS to an explicit production frontend origin
- Use strong password hashing and rotate secrets periodically
- Monitor logs for repeated unauthorized requests or failed auth attempts
- Review the OWASP Top 10 and validate the app against it
