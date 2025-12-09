# Vercel Deployment Guide

## Build Status ✅

The project builds successfully! All TypeScript errors have been resolved.

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `chidirudeboy/AfriBooking-Web-App---Agent-Manual-Booking-Only`
4. Vercel will auto-detect Next.js settings

### 2. Configure Environment Variables

In the Vercel project settings, add the following environment variable:

**Required:**
- `NEXT_PUBLIC_API_BASE_URL` - Your API base URL
  - Production: `https://api.africartz.com/api`
  - Staging: `https://staging-api.africartz.com/api`

### 3. Build Settings (Auto-detected)

Vercel will automatically detect:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or `next build`)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`

### 4. Deploy

Click "Deploy" and Vercel will:
1. Install dependencies
2. Run the build
3. Deploy your application

## Build Output

```
Route (app)                              Size     First Load JS
┌ ○ /                                    1.49 kB         111 kB
├ ○ /_not-found                          875 B            88 kB
├ ○ /bookings/add                        4.89 kB         119 kB
└ ○ /signin                              2.94 kB         117 kB
+ First Load JS shared by all            87.1 kB
```

All routes are statically generated and optimized.

## Post-Deployment Checklist

- [ ] Set `NEXT_PUBLIC_API_BASE_URL` environment variable in Vercel
- [ ] Test the sign-in functionality
- [ ] Test the booking creation flow
- [ ] Verify API connectivity
- [ ] Test on mobile devices
- [ ] Check that cookies are working (for authentication)

## Troubleshooting

### If build fails:
- Check that all environment variables are set
- Verify Node.js version (Vercel uses Node 18+ by default)
- Check build logs in Vercel dashboard

### If API calls fail:
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Check CORS settings on your API server
- Ensure API server allows requests from your Vercel domain

## Notes

- The app uses client-side cookies for authentication
- All API calls are made from the browser
- No server-side API routes needed
- Images are served from the `/public` folder

