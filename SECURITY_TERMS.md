# Cybersecurity Terms for Zoom Video App

This glossary explains cybersecurity concepts relevant to a video conferencing application built with Node.js, Express, React, Socket.io, and MySQL.

## Core Concepts

- **Authentication**: Verifying the identity of a user or service before granting access.
- **Authorization**: Granting or denying access to resources after authentication.
- **Identification**: Claiming an identity, such as a username or email address.
- **Authentication factor**: Something you know (password), have (token), or are (biometrics).
- **Principal**: The entity (user, service, or device) requesting access.
- **Session**: A period of time that an authenticated user remains logged in.
- **Token**: A credential used to prove identity for API requests or sessions.
- **Encryption**: Transforming data so only authorized parties can read it.
- **Hashing**: Generating a fixed-size digest of data that is hard to reverse.
- **Salt**: Random data added before hashing to protect against rainbow table attacks.
- **Secure hash**: A one-way hash function designed for password storage, such as bcrypt.
- **Signing**: Using a secret key to verify that data has not been modified.
- **Symmetric cryptography**: Using the same key for encryption and decryption.
- **Asymmetric cryptography**: Using a public/private key pair for encryption and digital signatures.
- **Certificate**: A signed document that proves an identity in TLS.

## Identity & Access Management

- **Bearer token**: A token passed in the `Authorization: Bearer <token>` header.
- **JWT (JSON Web Token)**: A compact token format used for stateless authentication.
- **Session token**: A token kept on the server to validate an active login.
- **Role-based access control (RBAC)**: Granting permissions based on user roles.
- **Least privilege**: Give each user and service only the access it needs.
- **Multi-factor authentication (MFA)**: Requiring two or more forms of verification.
- **Credential stuffing**: Using leaked username/password pairs to breach accounts.
- **Password policy**: Rules for password strength, length, and reuse.

## Data Protection

- **Data in transit**: Data moving across the network. Protect it with TLS/HTTPS.
- **Data at rest**: Data stored on disk or in a database. Protect it with encryption and access control.
- **TLS (Transport Layer Security)**: Encryption protocol for secure network communication.
- **HTTPS**: HTTP over TLS, required for secure browsers and private data.
- **At-rest encryption**: Encrypting database files, backups, or storage volumes.
- **End-to-end encryption (E2EE)**: Data encrypted by the sender and decrypted only by the recipient.
- **Key management**: Secure handling of encryption keys and secrets.
- **Secrets management**: Storing API keys, credentials, and tokens in secure vaults or env vars.
- **Application Security**: Designing and building software with security controls in place.
- **SAST**: Static Application Security Testing examines source code for vulnerabilities.
- **DAST**: Dynamic Application Security Testing examines running applications for vulnerabilities.
- **OWASP**: A set of common web application security risks and controls.

## Web Application Security

- **CORS (Cross-Origin Resource Sharing)**: Browser control over cross-origin API requests.
- **XSS (Cross-Site Scripting)**: Injecting malicious scripts into web content.
- **CSRF (Cross-Site Request Forgery)**: Forcing an authenticated user to perform unintended actions.
- **SQL/NoSQL injection**: Injecting unexpected payloads into database queries.
- **Input validation**: Ensuring user input matches expected formats.
- **Output encoding**: Escaping data before rendering it in the browser.
- **Content Security Policy (CSP)**: Browser policy that restricts allowed sources.
- **Security headers**: HTTP headers like `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.
- **Clickjacking**: Tricking users into clicking hidden UI elements.
- **Open redirect**: Redirecting users to attacker-controlled external sites.

## API & Backend Security

- **API security**: Protect APIs with authentication, authorization, validation, and logging.
- **Rate limiting**: Restricting requests from a single client to prevent abuse.
- **Throttling**: Slowing down repeated requests without blocking them entirely.
- **Input sanitization**: Removing dangerous characters from input data.
- **Output filtering**: Removing malicious content before returning responses.
- **Error handling**: Avoid exposing internal error details to clients.
- **Dependency auditing**: Checking packages for known vulnerabilities.
- **Secure configuration**: Using safe defaults and environment-specific settings.
- **Transport Layer Security**: Always use TLS for API communication.

## Real-Time & Socket Security

- **Socket authentication**: Verifying socket connections before allowing events.
- **Room authorization**: Ensuring only permitted users join private rooms.
- **Event validation**: Validating event payloads before acting on them.
- **Transport security**: Use `wss://` for secure WebSocket connections.
- **Replay protection**: Prevent reusing an old message or token.
- **Rate limiting for sockets**: Protect real-time channels from spam.

## Database Security

- **NoSQL injection**: Manipulating query objects to access or modify data.
- **Least privilege in DB accounts**: Grant only the permissions required.
- **Parameterization**: Build queries safely to avoid injection.
- **Input validation at the data layer**: Enforce schema rules and types.
- **Audit logs**: Track changes and access to sensitive data.
- **Backup encryption**: Encrypt backups and store them securely.

## Deployment & Infrastructure Security

- **Environment variables**: Keep secrets out of source code.
- **Infrastructure as code security**: Review IaC for insecure defaults.
- **Network segmentation**: Separate public-facing services from private resources.
- **Monitoring and alerting**: Detect suspicious activity quickly.
- **Security updates**: Keep OS, runtime, and dependencies patched.

## Threats & Attack Types

- **Brute force**: Trying many credential combinations until success.
- **Credential stuffing**: Reusing leaked credentials on multiple sites.
- **Man-in-the-middle (MITM)**: Intercepting network traffic.
- **Cross-site scripting (XSS)**: Executing scripts in another users browser.
- **Cross-site request forgery (CSRF)**: Making authenticated requests without consent.
- **Denial of Service (DoS)**: Overwhelming a service to make it unavailable.
- **Privilege escalation**: Gaining higher access than intended.
- **Information disclosure**: Leaking secrets or internal system data.

## Security Controls and Best Practices

- Use the principle of **least privilege** everywhere.
- Protect all API endpoints with authentication and authorization.
- Store secrets in environment variables or vaults, not in code.
- Use `https://` and secure WebSocket transports in production.
- Validate and sanitize user input on both client and server.
- Keep dependency versions up to date and run `npm audit`.
- Avoid sending tokens in URLs; use headers instead.
- Keep the attack surface small by disabling unused endpoints and features.

## How to Use This Glossary

- Review these terms while designing security improvements.
- Reference the glossary when auditing the backend, frontend, and real-time logic.
- Use this file alongside `SECURITY.md` to understand both concepts and implementation guidance.
