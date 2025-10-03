# External Configuration Required

## Meta/Facebook App Configuration

To enable Facebook and Instagram OAuth integration, you need to configure your Meta App with the following settings:

### 1. App Dashboard Settings
1. Go to https://developers.facebook.com/apps
2. Select your app (or create a new one)
3. Navigate to **Settings** → **Basic**

### 2. Configure OAuth Redirect URIs
Add the following redirect URI to your app's **Valid OAuth Redirect URIs**:

```
https://fmvbzhlqzzwzciqgbzgp.supabase.co/functions/v1/oauth-callback
```

### 3. App Permissions
Make sure your app has the following permissions approved:
- `instagram_basic` - Read basic Instagram account info
- `instagram_content_publish` - Publish content to Instagram
- `pages_show_list` - List Facebook Pages
- `pages_read_engagement` - Read engagement metrics
- `business_management` - Manage business accounts

### 4. App Review
For production use, submit your app for Meta's App Review to get these permissions approved for public users.

### 5. Test Users (Development)
While in development mode, only test users, developers, and testers added to your app can authenticate. Add test users in:
**Roles** → **Test Users**

---

## Current Configuration Status

✅ **Backend Security**: Fully configured
- Token encryption enabled
- Secure OAuth state management with CSRF protection
- Rate limiting on AI endpoints (5 requests/min)
- Security event logging
- Complete RLS policies

✅ **Authentication**: Fully configured
- Email/password authentication
- Session management
- Protected routes
- Auto-confirm email enabled for testing

⚠️ **External Configuration Needed**:
- Meta App OAuth redirect URI (see above)
- Meta App permissions approval

---

## Testing Your Setup

1. **Sign up** with email and password at `/auth`
2. **Navigate to Dashboard** after successful login
3. **Try to connect Facebook** - this will redirect to Meta's OAuth
4. **Verify the connection** appears in your dashboard after approval
5. **Generate AI suggestions** to test rate limiting

---

## Security Features Implemented

### Phase 1: Token Encryption ✅
- AES-256-GCM encryption for OAuth tokens
- Tokens encrypted before database storage
- Secure key derivation from app secret

### Phase 2: OAuth Security ✅
- Cryptographically random state tokens (256-bit)
- State stored in database with 10-minute expiration
- State consumption tracking (prevents replay attacks)
- CSRF protection via state validation

### Phase 3: Rate Limiting ✅
- 5 requests per minute per user for AI endpoint
- Sliding window rate limiting
- Automatic cleanup of old records
- Proper 429 status codes

### Phase 4: Complete RLS Policies ✅
- All tables protected with RLS
- User isolation enforced
- Service role access for edge functions
- Soft delete support with 30-day grace period

### Phase 5: Additional Hardening ✅
- Security headers (CSP, X-Frame-Options, etc.)
- Security event logging for all critical operations
- Failed authentication tracking
- OAuth callback monitoring

---

## Monitoring Security Events

Security events are logged to the `security_events` table:

```sql
SELECT * FROM security_events 
WHERE event_type IN (
  'oauth_connection_success',
  'oauth_invalid_state', 
  'oauth_callback_failed',
  'unauthorized_ai_request',
  'ai_generation_failed'
)
ORDER BY created_at DESC;
```

---

## Next Steps

1. ✅ Deploy the updated code (automatic)
2. ⚠️ Configure Meta App OAuth redirect URI (manual - see above)
3. ⚠️ Add test users to your Meta App (manual)
4. ✅ Test authentication flow
5. ✅ Test Facebook connection
6. ✅ Verify rate limiting works
7. ⚠️ Submit for Meta App Review (for production)

---

## Support

If you encounter issues:
1. Check the edge function logs in Lovable Cloud dashboard
2. Review security events in the database
3. Verify Meta App configuration matches the requirements above
4. Ensure test users are added to your Meta App in development mode
