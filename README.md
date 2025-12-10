# Hospital Management System (HM)

A comprehensive Hospital Management System built with Next.js 16, TypeScript, Material-UI, and Prisma.

## Features

### Core Features
- **Patient Management**: Registration, medical history tracking, patient dashboard
- **Appointment Scheduling**: Booking system with doctor availability management
- **Doctor & Staff Management**: Profiles, scheduling, role-based access
- **Billing & Payment**: Invoice generation, payment processing (Stripe ready)
- **Medical Inventory**: Pharmacy inventory tracking with low stock alerts
- **Reports & Analytics**: Patient data analytics, financial reports, performance metrics
- **User Authentication**: Secure login with NextAuth.js (Credentials, Google)
- **Real-Time Features**: 
  - Real-time notifications with Socket.io
  - Live chat between doctors and patients
  - Real-time appointment updates
  - Live dashboard statistics
  - Instant inventory alerts
- **AI Assistant** (OpenAI Integration):
  - AI-powered chat assistant for patients and doctors
  - Medical information and symptom analysis (non-diagnostic)
  - Appointment scheduling assistance
  - General system help and navigation
- **Role-Based Access Control**: Admin, Doctor, Patient roles

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript
- **UI Libraries**: 
  - Material-UI (MUI) v7
  - ShadCN UI
  - Tailwind CSS v4
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js v4
- **State Management**: React Hooks
- **Real-Time**: Socket.io for WebSocket connections
- **Notifications**: Sonner (toast notifications)
- **Data Grid**: MUI X Data Grid

## 🚀 Quick Deployment

**Fastest way to deploy:** See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

**Full deployment guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy! 🎉

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hms-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="mongodb://localhost:27017/hms-system"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI Configuration (Optional - for AI Assistant feature)
OPENAI_API_KEY="your-openai-api-key-here"
OPENAI_MODEL="gpt-3.5-turbo"  # Optional: defaults to gpt-3.5-turbo
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

   **For full real-time features (recommended):**
   ```bash
   npm run dev:server
   ```

   **Standard Next.js development:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: For full real-time functionality (Socket.io, live notifications, chat), use `npm run dev:server`. See [REALTIME_SETUP.md](./REALTIME_SETUP.md) for detailed setup instructions.

## Project Structure

```
hms-system/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # ShadCN UI components
│   │   └── ...
│   ├── lib/                   # Utility functions
│   ├── types/                 # TypeScript type definitions
│   └── theme.ts               # MUI theme configuration
├── public/                    # Static assets
└── ...
```

## Environment Variables

Required:
- `DATABASE_URL`: MongoDB connection string
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `NEXTAUTH_URL`: Application URL

Optional:
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google OAuth
- `STRIPE_SECRET_KEY` & `STRIPE_PUBLISHABLE_KEY`: For payment processing
- `REDIS_URL`: For caching (if using Redis)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`: For SMS/Telemedicine

## Database Models

- **User**: Authentication and user information
- **Patient**: Patient profiles and medical information
- **Doctor**: Doctor profiles and specializations
- **Appointment**: Appointment scheduling and management

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/patients/*` - Patient management
- `/api/appointments/*` - Appointment management
- `/api/billing/*` - Billing and payments
- `/api/inventory/*` - Inventory management
- `/api/availability/*` - Doctor availability
- `/api/notifications/*` - Real-time notifications
- `/api/dashboard/stats` - Dashboard statistics

## Development

### Available Scripts

- `npm run dev` - Start standard Next.js development server
- `npm run dev:server` - Start development server with Socket.io (recommended for real-time features)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run start:server` - Start production server with Socket.io
- `npm run lint` - Run ESLint

### Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Setup

Ensure all required environment variables are set in your production environment.

### Security Considerations

- All API routes are protected with authentication
- Role-based access control implemented
- Security headers configured in `next.config.ts`
- Environment variable validation included

## Real-Time Features

This HM System includes comprehensive real-time capabilities:

- ✅ **Real-Time Notifications**: Instant notifications for appointments, bills, and system updates
- ✅ **Live Chat**: Doctor-patient messaging with typing indicators
- ✅ **Real-Time Updates**: Live appointment status, dashboard statistics, and inventory alerts
- ✅ **WebSocket Support**: Powered by Socket.io for reliable real-time communication

See [REALTIME_SETUP.md](./REALTIME_SETUP.md) for detailed setup and configuration.

## Future Enhancements

- [ ] Telemedicine video consultations
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Insurance management integration
- [ ] Automated appointment reminders (SMS/Email)
- [ ] Redis adapter for horizontal scaling
- [ ] Message persistence and history
- [ ] File upload support for chat

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@hm-system.com or open an issue in the repository.
