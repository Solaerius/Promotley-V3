# Security Review Prompt for ChatGPT

Copy and paste this entire message to ChatGPT for a comprehensive security review:

---

Please conduct a thorough security review of my web application. I'm building a SaaS platform for social media content suggestions with the following architecture:

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Supabase (PostgreSQL + Edge Functions)
- Authentication: Supabase Auth (email/password)
- OAuth: Facebook/Instagram integration
- AI: Lovable AI (Gemini models)

## Security Measures Implemented

### 1. Authentication & Authorization
- ✅ Supabase Auth with email/password
- ✅ Session management with auto-refresh
- ✅ Protected routes with authentication checks
- ✅ RLS (Row Level Security) policies on all tables
- ✅ User isolation (users can only access their own data)
- ✅ JWT verification on edge functions

### 2. OAuth Security
- ✅ **Cryptographically secure state tokens** (256-bit random)
- ✅ **State stored in database** with 10-minute expiration
- ✅ **State consumption tracking** (prevents replay attacks)
- ✅ **CSRF protection** via state validation
- ✅ **Token encryption** using AES-256-GCM before storage
- ✅ **Tokens only accessible by service role** in edge functions
- ✅ **Security event logging** for all OAuth operations

### 3. Input Validation
- ✅ Client-side validation with Zod schemas
- ✅ Server-side validation in edge functions
- ✅ Email format validation
- ✅ Password complexity requirements (8+ chars, uppercase, lowercase, number)
- ✅ Input length limits on all fields
- ✅ Platform enum validation (instagram/facebook/tiktok)

### 4. Rate Limiting
- ✅ **5 requests per minute** limit on AI endpoint
- ✅ Sliding window rate limiting
- ✅ Per-user tracking in database
- ✅ Automatic cleanup of old rate limit records
- ✅ Proper 429 status codes returned

### 5. Data Protection
- ✅ **AES-256-GCM encryption** for OAuth access tokens
- ✅ **Encrypted storage** in database
- ✅ Tokens only decrypted when needed
- ✅ No sensitive data logged to console in production
- ✅ Soft delete with 30-day grace period
- ✅ User data anonymization on account deletion

### 6. Security Headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Strict-Transport-Security (HSTS)
- ✅ CORS configured for edge functions

### 7. Database Security
- ✅ RLS enabled on ALL tables
- ✅ Security definer functions for privileged operations
- ✅ No raw SQL execution allowed
- ✅ Service role access limited to edge functions
- ✅ User data isolated by user_id
- ✅ Audit logging via security_events table

### 8. Monitoring & Logging
- ✅ Security events logged for:
  - OAuth connections (success/failure)
  - Invalid state tokens
  - Unauthorized requests
  - AI generation failures
  - Rate limit violations
- ✅ Timestamps on all events
- ✅ User ID tracking (when available)
- ✅ Event details stored as JSONB

### 9. Edge Function Security
- ✅ All functions require authentication (JWT verification)
- ✅ No secrets exposed to client
- ✅ Service role key used for privileged operations
- ✅ Input validation before AI calls
- ✅ Error handling with security logging
- ✅ CORS and security headers

## Database Schema

### Tables with RLS:
1. **users** - User profiles and credits
   - Policies: Users can view/update own profile, INSERT via auth trigger
   
2. **connections** - Social media OAuth connections
   - Policies: Users can view/create/update/delete own connections
   
3. **tokens** - Encrypted OAuth tokens
   - Policies: Service role manages, users can view/delete own tokens
   
4. **suggestions** - AI-generated content suggestions
   - Policies: Users can view/create own suggestions
   
5. **consents** - Privacy policy consents
   - Policies: Users can view/create own consents
   
6. **metrics** - Social media performance metrics
   - Policies: Users can view/create own metrics

7. **oauth_states** - Temporary OAuth state tokens
   - Policies: Service role only (10-minute expiration)

8. **rate_limits** - API rate limiting tracking
   - Policies: Service role manages, users can view own limits

9. **security_events** - Security audit log
   - Policies: Service role only

## Areas to Review

Please specifically review:

1. **OAuth Flow Security**: Is the state token implementation secure against CSRF and replay attacks?

2. **Token Encryption**: Is the AES-256-GCM implementation secure? Should I use Supabase Vault instead?

3. **Rate Limiting**: Is 5 requests/min sufficient? Should I add additional rate limits on other endpoints?

4. **RLS Policies**: Are there any privilege escalation vulnerabilities in my RLS policies?

5. **Input Validation**: Are there any injection vulnerabilities I'm missing?

6. **Session Management**: Is the Supabase Auth session handling secure?

7. **Error Handling**: Am I leaking sensitive information in error messages?

8. **Encryption Key Management**: I'm deriving the encryption key from META_APP_SECRET. Is this secure?

9. **API Exposure**: Are there any endpoints that should be further restricted?

10. **Data Leakage**: Can users access data they shouldn't through any vector?

## Optional Improvements

What additional security measures would you recommend for:
- Production deployment
- Compliance (GDPR, etc.)
- Penetration testing prep
- Security monitoring
- Incident response

## Specific Concerns

1. Should I implement:
   - Content Security Policy (CSP)?
   - Additional security headers?
   - Two-factor authentication?
   - API key rotation?
   - More aggressive rate limiting?

2. Are there any:
   - Missing security policies?
   - Weak encryption practices?
   - Authorization bypasses?
   - Data exposure risks?
   - Compliance issues?

Please provide:
- **Critical vulnerabilities** (must fix before launch)
- **High priority issues** (fix soon)
- **Medium priority improvements** (nice to have)
- **Best practices recommendations**

Thank you for the comprehensive review!

---

**Note**: This application is currently in development. The Meta App is in development mode and only test users can authenticate.
