# AfriBooking Web App - Agent Portal

A Next.js web application for agents to manage manual bookings. This application provides a clean, responsive interface for signing in and creating manual bookings.

## Features

- 🔐 **Authentication**: Sign in and sign out functionality
- 📝 **Manual Booking Creation**: Easy-to-use form for creating manual bookings
- 📱 **Responsive Design**: Works seamlessly on all screen sizes (mobile, tablet, desktop)
- 🎨 **Modern UI**: Built with Tailwind CSS for a beautiful, modern interface

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Access to the AfriBooking API

### Installation

1. Navigate to the web-app directory:
```bash
cd web-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the `web-app` directory:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.africartz.com/api
```

For staging:
```env
NEXT_PUBLIC_API_BASE_URL=https://staging-api.africartz.com/api
```

For local development:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Project Structure

```
web-app/
├── app/
│   ├── bookings/
│   │   └── add/          # Manual booking creation page
│   ├── signin/           # Sign in page
│   ├── layout.tsx        # Root layout with AuthProvider
│   ├── page.tsx          # Home page (redirects)
│   └── globals.css       # Global styles
├── components/
│   └── ProtectedRoute.tsx # Route protection component
├── contexts/
│   └── AuthContext.tsx   # Authentication context
├── lib/
│   └── api.ts            # API client and endpoints
└── package.json
```

## Usage

### Sign In

1. Navigate to `/signin`
2. Enter your email/phone and password
3. Click "Sign in"

### Create Manual Booking

1. After signing in, you'll be redirected to `/bookings/add`
2. Fill in the booking details:
   - Check-in and check-out dates (required)
   - Select an apartment (required)
   - Client details (optional)
   - Pricing information (required)
   - Upload invoices/documents (optional)
3. Click "Create Booking"

## API Integration

The app uses the same API endpoints as the React Native app:
- `/auth/signin` - User authentication
- `/auth/profile` - Get user profile
- `/apartment/getAgentApartments` - Get agent's apartments
- `/bookings/manual/{agentId}` - Create manual booking

## Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

All forms and layouts adapt seamlessly to different screen sizes.

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **js-cookie** - Cookie management

## License

Private - AfriBooking Enterprise

