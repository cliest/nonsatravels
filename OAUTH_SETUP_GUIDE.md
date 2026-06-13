# OAuth Setup Guide - Nonsa Travels

This guide will help you set up Google, Facebook, and Apple authentication for your application.

## 🔴 **IMPORTANT: Your Google OAuth Client Was Deleted**

You're seeing the error `Error 401: deleted_client` because your Google OAuth2 client ID was deleted from Google Cloud Console. You need to create a **NEW** OAuth client.

---

## 1. Google OAuth Setup

### Steps:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create or Select a Project**:
   - Click the project dropdown at the top
   - Create a new project or select an existing one

3. **Enable Google+ API** (if not already enabled):
   - Go to "APIs & Services" > "Enable APIs and Services"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (for testing) or "Internal" (for organization only)
   - Fill in:
     - App name: **Nonsa Travels**
     - User support email: **your@email.com**
     - Developer contact: **your@email.com**
   - Add scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Add test users (important for development!)
   - Click "Save and Continue"

5. **Create OAuth 2.0 Client ID**:
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Name: **Nonsa Travels Web Client**
   
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost:3000
     https://yourdomain.com
     ```
   
   - **Authorized redirect URIs**:
     ```
     http://localhost:5173/auth/google/callback
     https://yourdomain.com/auth/google/callback
     ```
   
   - Click "CREATE"

6. **Copy Your Credentials**:
   - Copy the **Client ID** (looks like: `xxx-xxx.apps.googleusercontent.com`)
   - Paste it in `/client/.env`:
     ```env
     VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
     ```

7. **Test the Integration**:
   - Make sure you've added your email as a test user in the OAuth consent screen
   - Try signing in at http://localhost:5173/login

---

## 2. Facebook OAuth Setup

### Steps:

1. **Go to Facebook Developers**: https://developers.facebook.com/

2. **Create a New App**:
   - Click "Create App"
   - Choose "Consumer" as app type
   - App Name: **Nonsa Travels**
   - App Contact Email: **your@email.com**
   - Click "Create App"

3. **Add Facebook Login Product**:
   - From the dashboard, click "+ Add Product"
   - Find "Facebook Login" and click "Set Up"
   - Choose "Web" platform

4. **Configure Facebook Login Settings**:
   - Go to "Facebook Login" > "Settings"
   - **Valid OAuth Redirect URIs**:
     ```
     http://localhost:5173/auth/facebook/callback
     https://yourdomain.com/auth/facebook/callback
     ```
   - Save changes

5. **Get Your App Credentials**:
   - Go to "Settings" > "Basic"
   - Copy the **App ID**
   - Click "Show" to reveal and copy the **App Secret**

6. **Add to Environment Variables**:
   
   **Client** (`/client/.env`):
   ```env
   VITE_FACEBOOK_APP_ID=YOUR_APP_ID_HERE
   ```
   
   **Server** (`/server/.env`):
   ```env
   FACEBOOK_APP_ID=YOUR_APP_ID_HERE
   FACEBOOK_APP_SECRET=YOUR_APP_SECRET_HERE
   ```

7. **Set App Mode to Live** (when ready for production):
   - Go to top of dashboard, toggle from "Development" to "Live"
   - Complete App Review if required

8. **Request Advanced Permissions** (for production):
   - Go to "App Review" > "Permissions and Features"
   - Request **email** permission (required)
   - Request **public_profile** permission (usually pre-approved)

---

## 3. Apple Sign In Setup

### Prerequisites:
- An Apple Developer Account ($99/year)
- Your app must be registered in App Store Connect (or use a bundle ID for testing)

### Steps:

1. **Go to Apple Developer**: https://developer.apple.com/account/

2. **Create an App ID**:
   - Go to "Certificates, Identifiers & Profiles"
   - Click "Identifiers" > "+"
   - Select "App IDs" > "Continue"
   - Description: **Nonsa Travels**
   - Bundle ID: `com.nonsatravels.web` (explicit)
   - Check "Sign in with Apple"
   - Click "Continue" > "Register"

3. **Create a Services ID**:
   - Go to "Identifiers" > "+"
   - Select "Services IDs" > "Continue"
   - Description: **Nonsa Travels Web**
   - Identifier: `com.nonsatravels.web.client` (this is your CLIENT_ID)
   - Check "Sign in with Apple"
   - Click "Configure"
   
   - **Configure Sign in with Apple**:
     - Primary App ID: Select the App ID you created
     - **Domains and Subdomains**:
       ```
       localhost
       yourdomain.com
       ```
     - **Return URLs**:
       ```
       http://localhost:5173/auth/apple/callback
       https://yourdomain.com/auth/apple/callback
       ```
   - Click "Continue" > "Register"

4. **Create a Private Key**:
   - Go to "Keys" > "+"
   - Key Name: **Nonsa Travels Sign in with Apple Key**
   - Check "Sign in with Apple"
   - Click "Configure" > Select your Primary App ID
   - Click "Continue" > "Register"
   - **Download the key file** (AuthKey_XXXXXXXXXX.p8)
   - **Save the Key ID** (shown at the top)
   - **Note: You can only download this once!**

5. **Get Your Team ID**:
   - Go to "Membership" in the left sidebar
   - Copy your **Team ID** (10-character string)

6. **Add to Environment Variables**:
   
   **Client** (`/client/.env`):
   ```env
   VITE_APPLE_CLIENT_ID=com.nonsatravels.web.client
   ```
   
   **Server** (`/server/.env`):
   ```env
   APPLE_CLIENT_ID=com.nonsatravels.web.client
   APPLE_TEAM_ID=YOUR_TEAM_ID_HERE
   APPLE_KEY_ID=YOUR_KEY_ID_HERE
   APPLE_PRIVATE_KEY_PATH=/path/to/AuthKey_XXXXXXXXXX.p8
   ```

7. **Test in Development**:
   - Apple Sign In requires HTTPS in production
   - For localhost testing, it should work with HTTP

---

## Testing Your OAuth Integration

### 1. Update Environment Variables

Make sure all credentials are in place:

**Client** (`/client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
VITE_APPLE_CLIENT_ID=your-apple-client-id
```

**Server** (`/server/.env`):
```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
```

### 2. Restart Your Servers

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

### 3. Test Each Provider

1. **Go to**: http://localhost:5173/login
2. **Try each sign-in button**:
   - "Continue with Google"
   - "Continue with Facebook"
   - "Continue with Apple"

### 4. Common Issues

**Google:**
- ❌ Error 401: deleted_client → Create a new OAuth client
- ❌ Access blocked → Add your email as test user in OAuth consent screen
- ❌ redirect_uri_mismatch → Check redirect URIs match exactly

**Facebook:**
- ❌ Invalid redirect_uri → Add callback URL in Facebook app settings
- ❌ Email not received → Request email permission in App Review
- ❌ App in development mode → Only added testers can sign in

**Apple:**
- ❌ invalid_client → Check Services ID matches APPLE_CLIENT_ID
- ❌ invalid_request → Verify return URLs match exactly
- ❌ Certificate errors → Ensure private key file path is correct

---

## Production Deployment

### Before Going Live:

1. **Google**:
   - Add production domain to authorized origins
   - Add production redirect URI
   - Publish OAuth consent screen (if external)

2. **Facebook**:
   - Add production callback URL
   - Switch app mode to "Live"
   - Complete App Review for email permission

3. **Apple**:
   - Add production domain and return URL
   - Ensure HTTPS is enabled (required for Apple)
   - Keep private key secure (use environment variables, not committed to git)

4. **Security**:
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Add rate limiting
   - Implement CSRF protection
   - Add security headers

---

## Need Help?

- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **Facebook Login Docs**: https://developers.facebook.com/docs/facebook-login
- **Apple Sign In Docs**: https://developer.apple.com/sign-in-with-apple

---

## Quick Start Checklist

- [ ] Create new Google OAuth client (old one was deleted)
- [ ] Add test user email in Google OAuth consent screen
- [ ] Create Facebook app and get App ID + Secret
- [ ] Create Apple Services ID (requires developer account)
- [ ] Update all environment variables in both `/client/.env` and `/server/.env`
- [ ] Restart both frontend and backend servers
- [ ] Test sign-in with each provider
- [ ] Verify user accounts are created in MongoDB

---

**Note**: You can start with just Google OAuth if you want to test quickly. Facebook and Apple can be added later without affecting existing functionality.
