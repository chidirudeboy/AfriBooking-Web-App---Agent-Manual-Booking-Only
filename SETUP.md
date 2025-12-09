# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd web-app
npm install
```

## Step 2: Configure Environment

Create a `.env.local` file in the `web-app` directory:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.africartz.com/api
```

**For different environments:**

- **Production**: `https://api.africartz.com/api`
- **Staging**: `https://staging-api.africartz.com/api`
- **Local Development**: `http://localhost:8080/api` (or your local API URL)

## Step 3: Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Step 4: Access the Application

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. You'll be redirected to the sign-in page
3. Enter your agent credentials
4. After signing in, you'll be redirected to the booking creation page

## Troubleshooting

### API Connection Issues

If you're having trouble connecting to the API:

1. Check that `NEXT_PUBLIC_API_BASE_URL` is set correctly in `.env.local`
2. Ensure the API server is running and accessible
3. Check browser console for CORS errors
4. Verify your network connection

### Build Issues

If you encounter build errors:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to set `NEXT_PUBLIC_API_BASE_URL` in your production environment (Vercel, Netlify, etc.)

