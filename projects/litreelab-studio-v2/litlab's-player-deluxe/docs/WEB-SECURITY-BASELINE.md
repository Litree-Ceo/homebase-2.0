# Web Module Security Baseline

This document defines security best practices for all web modules (Dashboard, Social, Grid).

## 1. Authentication & Authorization

### Required Checks

- [ ] All sensitive endpoints require authentication
- [ ] User context validated on every request
- [ ] Session tokens properly validated
- [ ] Logout clears session/token
- [ ] CSRF tokens present on state-changing operations
- [ ] Authorization (role-based or attribute-based) enforced

### Implementation

```python
# Example: Protect endpoint with auth
@app.route('/api/data')
def get_data():
    user = require_auth(request)  # Will 401 if missing token
    if not has_role(user, 'admin'):
        return error("Forbidden", 403)
    return jsonify(get_sensitive_data(user.id))
```

## 2. Input Validation & Output Encoding

### Form & Query Validation

- [ ] All user input validated (type, length, format)
- [ ] Reject unexpected parameters
- [ ] Validate file uploads (size, type, content)
- [ ] Sanitize file names

### Example

```python
from pydantic import BaseModel, Field, validator

class DataInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    
    @validator('name')
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
```

### Output Encoding

- [ ] HTML output encoded (prevent XSS)
- [ ] JSON responses properly formatted
- [ ] Template auto-escaping enabled
- [ ] File downloads use proper Content-Disposition

## 3. CORS & Headers Security

### Required Headers

```javascript
// Express.js example
const cors = require('cors');
app.use(cors({
    origin: process.env.ALLOWED_CORS_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});
```

### Checklist

- [ ] CORS explicitly configured (not `*` in production)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: SAMEORIGIN or DENY
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security set
- [ ] Content-Security-Policy defined

## 4. API Rate Limiting

### Implementation

```python
# Example: Flask with rate limiting
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@app.route('/api/login', methods=['POST'])
@limiter.limit("5 per minute")  # Max 5 login attempts per minute
def login():
    ...
```

### Rate Limits

- [ ] Authentication endpoints: 5-10 per minute per IP
- [ ] API endpoints: 100-1000 per hour per user
- [ ] Public endpoints: 1000+ per hour per IP
- [ ] Return 429 (Too Many Requests) when exceeded

## 5. Data Protection

### Sensitive Data

- [ ] Passwords hashed with bcrypt/argon2 (NOT plaintext)
- [ ] API keys stored in `.env` (NOT in code)
- [ ] Tokens (JWT, sessions) have expiration
- [ ] Sensitive data in logs redacted
- [ ] Database fields masked in error messages

### Example: Secure Logging

```python
def log_safe(message, **kwargs):
    """Log message with sensitive fields redacted."""
    safe_kwargs = {}
    for key, value in kwargs.items():
        if key in ['password', 'token', 'api_key', 'secret']:
            safe_kwargs[key] = '***REDACTED***'
        else:
            safe_kwargs[key] = value
    logger.info(message, extra=safe_kwargs)
```

## 6. Error Handling

### Safe Error Messages

- [ ] Generic messages to users ("Invalid credentials")
- [ ] Detailed errors in logs only (NOT in response)
- [ ] Stack traces NOT exposed to client
- [ ] Error codes standardized (400, 401, 403, 404, 500, etc.)

### Example

```python
try:
    user = find_user(email)
except Exception as e:
    logger.exception(f"User lookup failed: {e}")  # Logs full error
    return error("Invalid email or password", 401)  # Generic response
```

## 7. Firebase Integration

### Rules Audit

- [ ] All Firestore rules require `request.auth != null`
- [ ] User-specific data matched to `request.auth.uid`
- [ ] Admin operations require custom claims
- [ ] Rules tested with emulator

### Example: Secure Firestore Rules

```
match /databases/{database}/documents {
  match /users/{userId} {
    allow read, write: if request.auth.uid == userId;
  }
  
  match /admin/{doc=**} {
    allow read, write: if request.auth.token.admin == true;
  }
}
```

## 8. Dependency Management

### Checks

- [ ] No known vulnerabilities: `pip audit` or `npm audit`
- [ ] Dependencies pinned to specific versions
- [ ] Dev dependencies separate from production
- [ ] Automated dependency updates (Dependabot)

### Commands

```bash
# Python
pip install -r requirements.txt
pip audit  # Check for vulnerabilities

# Node.js
npm install
npm audit
npm audit fix
```

## 9. Logging & Monitoring

### Events to Log

- [ ] Authentication (login, logout, failed attempts)
- [ ] Authorization (access denied)
- [ ] Data modification (create, update, delete)
- [ ] Admin actions
- [ ] Errors and exceptions

### PII Protection

- [ ] User IDs (okay to log)
- [ ] Emails (okay to log)
- [ ] Passwords (NEVER log)
- [ ] Tokens (log only first/last 4 chars)

## 10. Testing

### Security Tests

- [ ] Unit tests for auth/authz logic
- [ ] Integration tests for API endpoints
- [ ] Manual testing: try accessing without token
- [ ] Manual testing: try accessing others' data
- [ ] Test error messages don't leak info

### Test Template

```python
def test_api_requires_auth():
    """Verify endpoint rejects unauthenticated requests."""
    response = client.get('/api/sensitive')
    assert response.status_code == 401

def test_user_cannot_access_others_data():
    """Verify data isolation between users."""
    # Login as user1, try to access user2's data
    response = client.get(f'/api/users/user2/data', 
                         headers={'Authorization': f'Bearer {user1_token}'})
    assert response.status_code == 403
```

## Checklist for Module Owners

Before deploying to production, complete this checklist:

```
Authentication & Authorization:
  [ ] All sensitive endpoints protected
  [ ] Roles/permissions enforced
  [ ] Sessions properly managed

Input & Output:
  [ ] All inputs validated (type, length)
  [ ] Output encoded (XSS prevention)
  [ ] File uploads restricted

API Security:
  [ ] CORS properly configured
  [ ] Security headers set
  [ ] Rate limiting enabled
  [ ] Error messages generic

Data Protection:
  [ ] Passwords hashed (bcrypt/argon2)
  [ ] Secrets in .env
  [ ] Sensitive data redacted in logs
  [ ] Firebase rules audit completed

Infrastructure:
  [ ] HTTPS/TLS enabled
  [ ] Dependencies audited
  [ ] No known CVEs
  [ ] Monitoring/logging enabled

Testing:
  [ ] Security tests passing
  [ ] Manual testing completed
  [ ] Error handling verified
```

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [CWE Top 25](https://cwe.mitre.org/top25/)
