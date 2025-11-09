# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/documeai?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32

# Google OAuth (Get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI (Get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-openai-api-key

# Resend Email (Get from https://resend.com/api-keys)
RESEND_API_KEY=re_your-resend-api-key

# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## Setup Instructions

### 1. MongoDB Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string and replace `MONGODB_URI`

### 2. NextAuth Setup
1. Generate a secret: `openssl rand -base64 32`
2. Set `NEXTAUTH_SECRET` with the generated value
3. Set `NEXTAUTH_URL` to your deployment URL (or `http://localhost:3000` for development)

### 3. Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

### 4. OpenAI Setup
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key to `OPENAI_API_KEY`

### 5. Resend Email Setup
1. Go to [Resend](https://resend.com)
2. Sign up and verify your domain (or use their test domain)
3. Create an API key
4. Copy to `RESEND_API_KEY`

### 6. Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your test API keys from Developers > API keys
3. Copy Secret key to `STRIPE_SECRET_KEY`
4. For webhook secret:
   - Install Stripe CLI: `stripe login`
   - Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copy the webhook signing secret

## Important Notes

- Never commit `.env.local` to version control
- Use test/development keys for local development
- Switch to production keys when deploying
- Keep your API keys secure and rotate them regularly
