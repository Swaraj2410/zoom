# Syllabus Security Mapping for Zoom Video App

This file maps the project implementation to cybersecurity syllabus topics.

## Information Security
- Confidentiality: user passwords are hashed, tokens are stored securely, and secrets are loaded from environment variables.
- Integrity: user data and meeting history are stored using parameterized SQL queries to prevent tampering.
- Availability: rate limiting on API endpoints protects against brute-force and resource abuse.
- Risk Management: secure defaults, environment-based credentials, and dependency auditing are recommended.

## Cryptography
- Passwords are hashed with `bcrypt` before storage.
- Authentication tokens are generated with secure random values.
- The project recommends TLS (`HTTPS`) for all production deployments.

## Network Security
- `helmet` sets secure headers to reduce common web attacks.
- `cors` is configured to allow only configured frontend origins.
- Token-based authentication is enforced on protected routes.
- Socket.IO is now configured to require authenticated handshakes before joining real-time calls.
- The project is designed to support secure WebSocket transport (`wss://`) in production.

## Application Security
- Input validation is used in backend controllers.
- SQL parameterization is used in MySQL queries to prevent injection.
- Error handling avoids exposing internal implementation details.
- Security docs now reference OWASP, SAST, DAST, and penetration testing concepts.

## Cloud Security
- Secrets management is handled through environment variables instead of hard-coded values.
- The project suggests using secure cloud deployment practices, managed databases, and access controls.
- Documentation includes cloud security risks and recommended controls.

## Cyber Attacks and Penetration Testing
- The project structure supports testing for login, token authentication, API access, and socket event handling.
- Security docs discuss common threats such as brute force, injection, XSS, CSRF, and DoS.
- Penetration testing is mentioned as a future validation step.

## AI and Cybersecurity
- The docs include a high-level note that AI can support security monitoring and anomaly detection.
- This project does not yet implement AI security features, but the concept is captured in documentation.

## How to use this file
- Use this mapping when preparing project documentation or aligning the application with a security syllabus.
- Extend the project with TLS, cloud secret vaults, and penetration testing as next steps.
